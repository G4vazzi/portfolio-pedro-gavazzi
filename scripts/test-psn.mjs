import {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    getUserTrophyProfileSummary,
    getUserTitles
} from "psn-api";

async function main() {

    /* ========================================
       1. VALIDAR TOKEN NPSSO
    ======================================== */

    const npsso = (process.env.PSN_NPSSO ?? "").trim();

    if (!/^[A-Za-z0-9_-]{64}$/.test(npsso)) {
        throw new Error(
            "NPSSO ausente ou inválido. " +
            "Informe os 64 caracteres do token."
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


    console.log("\nETAPA 2: Solicitando tokens...");

    const tokens =
        await exchangeAccessCodeForAuthTokens(accessCode);

    if (!tokens.accessToken) {
        throw new Error("Token de acesso não recebido.");
    }

    // CORREÇÃO DO ERRO ANTERIOR
    const authorization = {
        accessToken: tokens.accessToken
    };

    console.log("ETAPA 2: Concluída.");


    /* ========================================
       3. CONSULTAR PERFIL
    ======================================== */

    console.log("\nETAPA 3: Consultando troféus...");

    const profile = await getUserTrophyProfileSummary(
        authorization,
        "me"
    );

    console.log("ETAPA 3: Concluída.");

    console.log(
        "Nível PSN:",
        profile.trophyLevel
    );

    console.log(
        "Total de platinas:",
        profile.earnedTrophies?.platinum ?? 0
    );


    /* ========================================
       4. CONSULTAR JOGOS
    ======================================== */

    console.log("\nETAPA 4: Consultando jogos...");

    const response = await getUserTitles(
        authorization,
        "me",
        { limit: 5 }
    );

    console.log("ETAPA 4: Concluída.");

    console.log("\nJOGOS ENCONTRADOS:");

    for (const game of response.trophyTitles ?? []) {

        console.log(
            game.trophyTitleName,
            "| Platinas:",
            game.earnedTrophies?.platinum ?? 0
        );

    }

    console.log("\nTESTE FINALIZADO COM SUCESSO!");

}


/* ========================================
   TRATAMENTO DE ERROS
======================================== */

main().catch(error => {

    console.error("\nERRO NA INTEGRAÇÃO PSN");

    console.error("Mensagem:", error.message);

    console.error(
        "Código:",
        error.cause?.code ?? "Não informado"
    );

    process.exitCode = 1;

});