
"use strict";

import {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    getPurchasedGames,
    getUserTitles
} from "psn-api";

import {
    mkdir,
    writeFile
} from "node:fs/promises";


/* ========================================
   1. AUTENTICAÇÃO
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
   2. CONSULTAR BIBLIOTECA COMPLETA
======================================== */

async function getLibrary(authorization) {

    const games = [];

    const size = 50;
    let start = 0;

    while (true) {

        const response = await getPurchasedGames(
            authorization,
            {
                platform: ["ps4", "ps5"],
                size,
                start
            }
        );

        const library =
            response?.data?.purchasedTitlesRetrieve;

        if (!library || !Array.isArray(library.games)) {
            throw new Error(
                "Resposta da biblioteca PSN inválida."
            );
        }

        const page = library.games;

        games.push(...page);
        start += page.length;

        console.log(
            `Registros consultados: ${games.length}`
        );

        const total = Number(
            library.pageInfo?.totalCount
        );

        if (
            page.length === 0 ||
            library.pageInfo?.isLast === true ||
            (Number.isFinite(total) && start >= total) ||
            (!Number.isFinite(total) && page.length < size)
        ) {
            break;
        }
    }

    return games;
}

/* ========================================
   CONSULTAR JOGOS DO HISTÓRICO DE TROFÉUS
======================================== */

async function getTrophyGames(authorization) {

    const titles = [];
    const limit = 200;

    let offset = 0;

    while (true) {

        const response = await getUserTitles(
            authorization,
            "me",
            { limit, offset }
        );

        const page = response.trophyTitles ?? [];

        if (!Array.isArray(page)) {
            throw new Error(
                "Resposta do histórico de troféus inválida."
            );
        }

        titles.push(...page);
        offset += page.length;

        const total = Number(response.totalItemCount);

        if (
            page.length === 0 ||
            (Number.isFinite(total) && offset >= total) ||
            page.length < limit
        ) {
            break;
        }
    }

    console.log(
        "Jogos com histórico de troféus:",
        titles.length
    );

    return titles
        .filter(game => game.trophyTitleName)
        .map(game => ({

            name: game.trophyTitleName,

            platform:
                game.trophyTitlePlatform ?? "PlayStation",

            image: {
                url: game.trophyTitleIconUrl ?? ""
            },

            isPreOrder: false

        }));
}


/* ========================================
   3. ORGANIZAR OS JOGOS
======================================== */

function organizeGames(library) {

    const unique = new Map();

    let preorderCount = 0;
    let extraCount = 0;
    let duplicateCount = 0;

    for (const game of library) {

        if (!game.name) continue;

        const name = game.name.trim();

        // Excluir pré-vendas identificadas pela API.
        if (game.isPreOrder === true) {
            preorderCount++;
            continue;
        }

        // Excluir conteúdos adicionais que não são jogos.
        if (/\b(artbook|soundtrack)\b/i.test(name)) {
            extraCount++;
            continue;
        }

        const platform = String(
            game.platform ?? "PlayStation"
        ).toUpperCase();

        const imageUrl =
            typeof game.image?.url === "string" &&
            game.image.url.startsWith("https://")
                ? game.image.url
                : "";

        // Evitar jogos repetidos em diferentes plataformas.
        const key = name
            .normalize("NFKC")
            .toLocaleLowerCase("pt-BR")
            .replace(/[™®©]/g, "")
            .replace(/[‘’]/g, "'")
            .replace(/\s+/g, " ")
            .trim();


        if (unique.has(key)) {

            duplicateCount++;

            const existing = unique.get(key);

            if (!existing.platforms.includes(platform)) {
                existing.platforms.push(platform);
            }

            // Priorizar a imagem PS5, quando disponível.
            if (imageUrl && (
                !existing.imageUrl || platform === "PS5"
            )) {
                existing.imageUrl = imageUrl;
            }

            continue;
        }

        unique.set(key, {
            name,
            platforms: [platform],
            imageUrl
        });
    }

    console.log("Pré-vendas filtradas:", preorderCount);
    console.log("Extras filtrados:", extraCount);
    console.log("Duplicações agrupadas:", duplicateCount);

    return [...unique.values()];
}


/* ========================================
   4. GERAR JSON
======================================== */

async function main() {

    const authorization = await authenticate();

    console.log("\nConsultando biblioteca PlayStation...");

    const library = await getLibrary(authorization);

    const trophyGames = await getTrophyGames(authorization);

    const allGames = [...library, ...trophyGames];

    const games = organizeGames(allGames);

    console.log("Total de registros consultados:", allGames.length);

    const output = {
        platform: "PlayStation",
        updatedAt: new Date().toISOString(),
        totalGames: games.length,
        games
    };

    await mkdir("data", {
        recursive: true
    });

    await writeFile(
        "data/psn-library.json",
        JSON.stringify(output, null, 2),
        "utf8"
    );

    console.log("\n================================");
    console.log("BIBLIOTECA SINCRONIZADA");
    console.log("================================");

    console.log("Registros originais:", library.length);
    console.log("Jogos organizados:", games.length);

    console.log("\nJOGOS:");

    for (const game of games) {

        console.log(
            "-",
            game.name,
            "|",
            game.platforms.join(", ")
        );
    }

    console.log(
        "\nArquivo gerado: data/psn-library.json"
    );
}


main().catch(error => {

    console.error("\nERRO NA SINCRONIZAÇÃO");

    console.error("Mensagem:", error.message);

    process.exitCode = 1;

});
