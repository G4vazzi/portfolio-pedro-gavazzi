import {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    getUserTrophyProfileSummary,
    getUserTitles
} from "psn-api";

async function main() {

    const npsso = (process.env.PSN_NPSSO ?? "").trim();

    if (!npsso) {
        throw new Error("Token PSN_NPSSO não configurado.");
    }

    // Exibe apenas o comprimento, nunca o token.
    console.log("Comprimento do NPSSO:", npsso.length);

    // Valida o formato esperado do NPSSO.
    if (!/^[A-Za-z0-9_-]{64}$/.test(npsso)) {
        throw new Error(
            "Formato NPSSO inválido. Copie somente os 64 caracteres " +
            "do valor npsso, sem aspas, chaves ou espaços."
        );
    }

    console.log("Conectando à PlayStation Network...");

    // Autenticação
    console.log("ETAPA 1: Solicitando Código de acesso...");
    const accessCode = 
        await exchangeNpssoForAccessCode(npsso);

    console.log("ETAPA 1: Concluida.")

    console.log("ETAPA 2: Solicitando Tokens de autenticação...");
    const tokens =
        await exchangeAccessCodeForAuthTokens(accessCode);

    console.log("ETAPA 2: Concluida.")

    // Perfil de troféus
    const profile =
        await getUserTrophyProfileSummary(
            authorization,
            "me"
        );

    console.log("Conexão realizada!");

    console.log(
        "Nível de troféus:",
        profile.trophyLevel
    );

    console.log(
        "Total de platinas:",
        profile.earnedTrophies?.platinum ?? 0
    );

    // Consulta alguns jogos
    const result = await getUserTitles(
        authorization,
        "me",
        { limit: 5 }
    );

    console.log("\nJogos encontrados:");

    for (const game of result.trophyTitles ?? []) {
        console.log(
            "-",
            game.trophyTitleName,
            "| Platinas:",
            game.earnedTrophies?.platinum ?? 0
        );
    }

}

main().catch(error => {

    console.error("\nERRO NA INTEGRAÇÃO PSN");

    console.error("Mensagem:", error.message);

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