
"use strict";

import { mkdir, writeFile } from "node:fs/promises";

/* ========================================
   PG REALITY - STEAM LIBRARY SYNC
======================================== */

const steamId = (process.env.STEAM_ID ?? "").trim();
const apiKey = (process.env.STEAM_API_KEY ?? "").trim();

async function main() {

    if (!/^\d{17}$/.test(steamId)) {
        throw new Error("STEAM_ID inválido.");
    }

    if (!apiKey) {
        throw new Error("STEAM_API_KEY não configurada.");
    }

    console.log("Consultando biblioteca Steam...");

    const url = new URL(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
    );

    url.searchParams.set("key", apiKey);
    url.searchParams.set("steamid", steamId);
    url.searchParams.set("include_appinfo", "1");
    url.searchParams.set("include_played_free_games", "1");
    url.searchParams.set("format", "json");

    const response = await fetch(url, {
        signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
        throw new Error(
            `Erro na API Steam: HTTP ${response.status}`
        );
    }

    const data = await response.json();
    const rawGames = data?.response?.games;

    if (!Array.isArray(rawGames)) {
        throw new Error(
            "Nenhum catálogo foi retornado. Verifique o " +
            "SteamID64, a chave e a privacidade dos jogos."
        );
    }

    /* ========================================
       ORGANIZAR JOGOS
    ======================================== */

    const games = rawGames
        .filter(game =>
            Number.isInteger(game.appid) &&
            typeof game.name === "string" &&
            game.name.trim()
        )
        .map(game => {

            const appId = game.appid;

            const base =
                "https://shared.fastly.steamstatic.com" +
                `/store_item_assets/steam/apps/${appId}`;

            return {
                appId,
                name: game.name.trim(),

                platforms: ["PC"],

                imageUrl:
                    `${base}/library_600x900.jpg`,

                fallbackImageUrl:
                    `${base}/header.jpg`,

                playtimeHours:
                    Math.round(
                        (game.playtime_forever ?? 0) / 60
                    )
            };
        })
        .sort((a, b) =>
            b.playtimeHours - a.playtimeHours ||
            a.name.localeCompare(b.name, "pt-BR")
        );

    const output = {
        platform: "Steam",
        updatedAt: new Date().toISOString(),
        totalGames: games.length,
        games
    };

    await mkdir("data", {
        recursive: true
    });

    await writeFile(
        "data/steam-library.json",
        JSON.stringify(output, null, 2),
        "utf8"
    );

    console.log("\n================================");
    console.log("STEAM LIBRARY SINCRONIZADA");
    console.log("================================");

    console.log("Jogos encontrados:", games.length);

    for (const game of games) {
        console.log(
            `- ${game.name} (${game.playtimeHours} h)`
        );
    }

    console.log(
        "\nArquivo gerado: data/steam-library.json"
    );
}

main().catch(error => {
    console.error(
        "ERRO NA SINCRONIZAÇÃO:",
        error.message
    );

    process.exitCode = 1;
});
