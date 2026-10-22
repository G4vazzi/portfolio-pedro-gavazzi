"use strict";

import {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    getUserTrophyProfileSummary,
    getUserTitles,
    getUserTrophiesEarnedForTitle
} from "psn-api";

import { mkdir, writeFile } from "node:fs/promises";


/* ========================================
   1. AUTENTICAÇÃO PSN
======================================== */

async function authenticate() {

    const npsso = (process.env.PSN_NPSSO ?? "").trim();

    if (!/^[A-Za-z0-9_-]{64}$/.test(npsso)) {
        throw new Error("NPSSO ausente ou inválido.");
    }

    console.log("Autenticando na PlayStation...");

    const accessCode =
        await exchangeNpssoForAccessCode(npsso);

    const tokens =
        await exchangeAccessCodeForAuthTokens(accessCode);

    if (!tokens.accessToken) {
        throw new Error("Token de acesso não recebido.");
    }

    console.log("Autenticação concluída.");

    return {
        accessToken: tokens.accessToken
    };
}


/* ========================================
   2. CONSULTAR TODOS OS JOGOS
======================================== */

async function getAllGames(authorization) {

    const games = [];
    const limit = 200;

    let offset = 0;

    while (true) {

        const response = await getUserTitles(
            authorization,
            "me",
            { limit, offset }
        );

        const page = response.trophyTitles ?? [];

        if (!page.length) break;

        games.push(...page);
        offset += page.length;

        if (
            offset >= response.totalItemCount ||
            page.length < limit
        ) {
            break;
        }
    }

    return games;
}


/* ========================================
   3. LOCALIZAR DATA DA PLATINA
======================================== */

async function getPlatinumDate(authorization, game) {

    // Jogos PS4, PS3 e Vita usam "trophy".
    // Jogos PS5 usam "trophy2".
    const service = game.npServiceName ||
        (game.trophyTitlePlatform?.includes("PS5")
            ? "trophy2"
            : "trophy");

    let offset = 0;

    while (true) {

        const response =
            await getUserTrophiesEarnedForTitle(
                authorization,
                "me",
                game.npCommunicationId,
                "default",
                {
                    npServiceName: service,
                    limit: 100,
                    offset
                }
            );

        const trophies = response.trophies ?? [];

        const platinum = trophies.find(trophy =>
            trophy.trophyType === "platinum" &&
            trophy.earned === true &&
            trophy.earnedDateTime
        );

        if (platinum) {
            return platinum.earnedDateTime;
        }

        const next = response.nextOffset;

        if (
            !Number.isInteger(next) ||
            next <= offset
        ) {
            break;
        }

        offset = next;
    }

    return null;
}


/* ========================================
   4. SINCRONIZAR CONQUISTAS
======================================== */

async function main() {

    const authorization = await authenticate();

    console.log("\nConsultando seu perfil...");

    const profile =
        await getUserTrophyProfileSummary(
            authorization,
            "me"
        );

    const platinumCount =
        Number(profile.earnedTrophies?.platinum ?? 0);

    const trophyLevel =
        Number(profile.trophyLevel);

    console.log("Nível PSN:", trophyLevel);
    console.log("Total de platinas:", platinumCount);

    console.log("\nConsultando biblioteca de jogos...");

    const games = await getAllGames(authorization);

    console.log("Jogos encontrados:", games.length);

    const completedGames = games.filter(
        game => Number(game.earnedTrophies?.platinum ?? 0) > 0
    );

    console.log(
        "Jogos com platina:",
        completedGames.length
    );

    const platinums = [];

    for (const game of completedGames) {

        console.log(
            "Verificando:",
            game.trophyTitleName
        );

        const earnedAt =
            await getPlatinumDate(authorization, game);

        if (!earnedAt || Number.isNaN(Date.parse(earnedAt))) {
            throw new Error(
                `Não foi possível identificar a data da platina: ` +
                game.trophyTitleName
            );
        }

        platinums.push({
            name: game.trophyTitleName,
            platform: game.trophyTitlePlatform,
            iconUrl: game.trophyTitleIconUrl ?? "",
            earnedAt
        });
    }

    // Ordenar pela data real da conquista.
    platinums.sort(
        (a, b) =>
            Date.parse(b.earnedAt) -
            Date.parse(a.earnedAt)
    );

    if (platinums.length < Math.min(5, platinumCount)) {
        throw new Error(
            "Foram encontradas menos platinas que o esperado. " +
            "O arquivo existente não será sobrescrito."
        );
    }

    const latestPlatinums = platinums.slice(0, 5);

    /* ========================================
       5. GERAR ARQUIVO JSON
    ======================================== */

    const output = {
        onlineId: "",
        profileUrl: "",
        trophyLevel,
        platinumCount,
        updatedAt: new Date().toISOString(),
        platinums: latestPlatinums
    };

    await mkdir("data", { recursive: true });

    await writeFile(
        "data/psn-trophies.json",
        JSON.stringify(output, null, 2),
        "utf8"
    );

    console.log("\n================================");
    console.log("SINCRONIZAÇÃO CONCLUÍDA");
    console.log("================================");

    for (const trophy of latestPlatinums) {
        console.log(
            trophy.name,
            "-",
            new Date(trophy.earnedAt)
                .toLocaleDateString("pt-BR")
        );
    }

    console.log(
        "\nArquivo gerado: data/psn-trophies.json"
    );
}


main().catch(error => {

    console.error("\nERRO NA SINCRONIZAÇÃO");
    console.error(error.message);

    process.exitCode = 1;
});