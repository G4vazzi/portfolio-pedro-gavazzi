"use strict";

import {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    getPurchasedGames
} from "psn-api";

async function main() {

    const npsso = (process.env.PSN_NPSSO ?? "").trim();

    if (!/^[A-Za-z0-9_-]{64}$/.test(npsso)) {
        throw new Error("NPSSO ausente ou inválido.");
    }

    /* ========================================
       1. AUTENTICAR
    ======================================== */

    console.log("Conectando à PlayStation Network...");

    const accessCode =
        await exchangeNpssoForAccessCode(npsso);

    const tokens =
        await exchangeAccessCodeForAuthTokens(accessCode);

    const authorization = {
        accessToken: tokens.accessToken
    };

    console.log("Autenticação concluída.");


    /* ========================================
       2. CONSULTAR BIBLIOTECA
    ======================================== */

    console.log("\nConsultando biblioteca PlayStation...");

    const response = await getPurchasedGames(
        authorization,
        {
            platform: ["ps4", "ps5"],
            size: 20,
            start: 0
        }
    );

    const library =
        response?.data?.purchasedTitlesRetrieve;

    if (!library) {
        console.log(
            "Campos da resposta:",
            Object.keys(response ?? {})
        );

        throw new Error(
            "Formato da resposta não reconhecido."
        );
    }

    const games = library.games ?? [];

    console.log("\nJogos recebidos:", games.length);

    console.log(
        "Total na biblioteca:",
        library.pageInfo?.totalCount ?? "Não informado"
    );


    /* ========================================
       3. VERIFICAR DADOS DOS JOGOS
    ======================================== */

    const result = games.map(game => ({
        nome: game.name,
        plataforma: game.platform,
        possuiImagem: Boolean(game.image?.url)
    }));

    console.table(result);

    if (games.length > 0) {

        console.log(
            "\nCampos disponíveis:",
            Object.keys(games[0])
        );

    }

    console.log("\nTESTE CONCLUÍDO.");

}

main().catch(error => {

    console.error("\nERRO NA BIBLIOTECA PSN");
    console.error("Mensagem:", error.message);

    process.exitCode = 1;

});