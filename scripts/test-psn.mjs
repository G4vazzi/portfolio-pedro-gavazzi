"use strict";

import {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    getUserTrophyProfileSummary,
    getUserTitles
} from "psn-api";

async function main() {

    /* ========================================
       1. VALIDAR NPSSO
    ======================================== */

    const npsso = (process.env.PSN_NPSSO ?? "").trim();

    if (!npsso) {
        throw new Error(
            "Token PSN_NPSSO não configurado."
        );
    }

    if (!/^[A-Za-z0-9_-]{64}$/.test(npsso)) {
        throw new Error(
            "Formato NPSSO inválido."
        );
    }

    console.log("NPSSO validado.");
    console.log("Conectando à PlayStation Network...");


    /* ========================================
       2. AUTENTICAÇÃO
    ======================================== */

    console.log("\nETAPA 1: Solicitando código de acesso...");

    const accessCode =
        await exchangeNpssoForAccessCode(npsso);

    console.log("ETAPA 1: Concluída.");


    console.log("\nETAPA 2: Obtendo tokens...");

    const tokens =
        await exchangeAccessCodeForAuthTokens(accessCode);

    console.log("ETAPA 2: Concluída.");


    /* ========================================
       3. AUTORIZAÇÃO
    ======================================== */

    const authorization = {
        accessToken: tokens.accessToken
    };

    console.log("\nAutorização configurada.");


    /* ========================================
       4. CONSULTAR PERFIL PSN
    ======================================== */

    console.log("\nETAPA 3: Consultando troféus...");

    const profile =
        await getUserTrophyProfileSummary(
            authorization,
            "me"
        );

    console.log("ETAPA 3: Concluída.");

    console.log("\n===== PERFIL PLAYSTATION =====");

    console.log(
        "Nível:",
        profile.trophyLevel
    );

    console.log(
        "Platina:",
        profile.earnedTrophies?.platinum ?? 0
    );

    console.log(
        "Ouro:",
        profile.earnedTrophies?.gold ?? 0
    );

    console.log(
        "Prata:",
        profile.earnedTrophies?.silver ?? 0
    );

    console.log(
        "Bronze:",
        profile.earnedTrophies?.bronze ?? 0
    );


    /* ========================================
       5. CONSULTAR JOGOS
    ======================================== */

    console.log("\nETAPA 4: Consultando jogos...");

    const response = await getUserTitles(
        authorization,
        "me",
        {
            limit: 10,
            offset: 0
        }
    );

    console.log("ETAPA 4: Concluída.");

    console.log("\n===== JOGOS ENCONTRADOS =====");

    const games = response.trophyTitles ?? [];

    games.forEach((game, index) => {

        const platinum =
            game.earnedTrophies?.platinum ?? 0;

        console.log(
            `${index + 1}. ${game.trophyTitleName}`
        );

        console.log(
            `   Platina: ${platinum > 0 ? "SIM" : "NÃO"}`
        );

    });

    console.log("\n===== TESTE FINALIZADO =====");

}


/* ========================================
   TRATAMENTO DE ERROS
======================================== */

main().catch(error => {

    console.error("\nERRO NA INTEGRAÇÃO PSN");

    console.error(
        "Mensagem:",
        error.message
    );

    console.error(
        "Código:",
        error.cause?.code ?? "Não informado"
    );

    console.error(
        "Detalhe:",
        error.cause?.message ?? "Não informado"
    );

    process.exitCode = 1;

});