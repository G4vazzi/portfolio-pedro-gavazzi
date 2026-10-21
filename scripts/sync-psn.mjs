import {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    getUserTitles,
    getUserTrophiesEarnedForTitle,
    getUserTrophyProfileSummary
} from "psn-api";

import { mkdir, writeFile } from "node:fs/promises";

const npsso = process.env.PSN_NPSSO;

if (!npsso) {
    throw new Error("Configure o segredo PSN_NPSSO.");
}

// Autenticação feita apenas no ambiente privado.
const accessCode = await exchangeNpssoForAccessCode(npsso);

const tokens = await exchangeAccessCodeForAuthTokens(
    accessCode
);

const authorization = {
    accessToken: tokens.accessToken
};

// Total de platinas.
const summary = await getUserTrophyProfileSummary(
    authorization,
    "me"
);

const platinumCount =
    summary.earnedTrophies?.platinum ?? 0;

// Busca a lista completa de jogos.
const titles = [];

let offset = 0;
let total = Infinity;

while (offset < total) {

    const response = await getUserTitles(
        authorization,
        "me",
        { limit: 200, offset }
    );

    const page = response.trophyTitles ?? [];

    if (!page.length) break;

    titles.push(...page);

    offset += page.length;

    total = response.totalItemCount ?? offset;
}

// Seleciona jogos com platina.
const candidates = titles
    .filter(game => Number(game.earnedTrophies?.platinum) > 0)
    .sort((a, b) =>
        Date.parse(b.lastUpdatedDateTime || 0) -
        Date.parse(a.lastUpdatedDateTime || 0)
    );

// Localiza a data real da platina em cada jogo.
async function getPlatinumDate(game) {

    let trophyOffset = 0;

    while (true) {

        const result = await getUserTrophiesEarnedForTitle(
            authorization,
            "me",
            game.npCommunicationId,
            "default",
            {
                npServiceName: game.npServiceName,
                limit: 100,
                offset: trophyOffset
            }
        );

        const trophies = result.trophies ?? [];

        const platinum = trophies.find(trophy =>
            trophy.trophyType === "platinum" &&
            trophy.earned === true &&
            trophy.earnedDateTime
        );

        if (platinum) {
            return platinum.earnedDateTime;
        }

        if (
            typeof result.nextOffset !== "number" ||
            result.nextOffset <= trophyOffset
        ) {
            return null;
        }

        trophyOffset = result.nextOffset;
    }
}

const platinums = [];

for (const game of candidates) {

    // Só para quando os jogos restantes não puderem
    // conter uma platina mais recente que a quinta.
    if (
        platinums.length >= 5 &&
        Date.parse(game.lastUpdatedDateTime) <
        Date.parse(platinums[4].earnedAt)
    ) {
        break;
    }

    const earnedAt = await getPlatinumDate(game);

    if (!earnedAt) continue;

    platinums.push({
        name: game.trophyTitleName,
        platform: game.trophyTitlePlatform,
        iconUrl: game.trophyTitleIconUrl,
        earnedAt
    });

    platinums.sort(
        (a, b) =>
            Date.parse(b.earnedAt) - Date.parse(a.earnedAt)
    );

    if (platinums.length > 5) {
        platinums.pop();
    }
}

if (platinumCount > 0 && platinums.length === 0) {
    throw new Error(
        "Nenhuma data de platina encontrada. Dados antigos preservados."
    );
}

const output = {
    onlineId: process.env.PSN_ONLINE_ID || "",
    profileUrl: process.env.PSN_PROFILE_URL || "",
    updatedAt: new Date().toISOString(),
    platinumCount,
    platinums
};

await mkdir("data", { recursive: true });

await writeFile(
    "data/psn-trophies.json",
    JSON.stringify(output, null, 2),
    "utf8"
);

console.log(
    `Sincronização concluída: ${platinums.length} platinas recentes.`
);