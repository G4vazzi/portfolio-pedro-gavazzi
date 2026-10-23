"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       1. CONFIGURAÇÃO DAS BIBLIOTECAS
    ======================================== */

    const libraries = {

        psn: {
            file: "./data/psn-library.json",
            track: document.getElementById("psnLibraryTrack"),
            status: document.getElementById("psnLibraryStatus"),
            count: document.getElementById("psnLibraryCount"),
            platform: "PlayStation"
        },

        steam: {
            file: "./data/steam-library.json",
            track: document.getElementById("steamLibraryTrack"),
            status: document.getElementById("steamLibraryStatus"),
            count: document.getElementById("steamLibraryCount"),
            platform: "Steam"
        }

    };


    /* ========================================
       2. CRIAR CARD DE JOGO
    ======================================== */

    function createGameCard(game, platform) {

        const card = document.createElement("article");
        card.className = "game-library__card";

        const fallback = document.createElement("div");
        fallback.className = "game-library__placeholder";
        fallback.textContent = "◈";

        let imageUrl = null;

        try {
            const url = new URL(game.imageUrl);

            if (url.protocol === "https:") {
                imageUrl = url.href;
            }

        } catch {
            // Imagem indisponível.
        }

        if (imageUrl) {

            const image = document.createElement("img");

            image.className = "game-library__image";
            image.src = imageUrl;
            image.alt = `Imagem de ${game.name}`;
            image.loading = "lazy";

            const fallbackUrl =
                typeof game.fallbackImageUrl === "string" &&
                game.fallbackImageUrl.startsWith("https://")
                    ? game.fallbackImageUrl
                    : null;
                    
            let fallbackTried = false;

            image.onerror = () => {
                if (fallbackUrl && !fallbackTried) {

                    fallbackTried = true;
                    image.src = fallbackUrl;
                    return;

                }

                image.replaceWith(fallback);
            };
            
            card.appendChild(image);

        } else {

            card.appendChild(fallback);

        }

        const info = document.createElement("div");
        info.className = "game-library__info";

        const name = document.createElement("strong");
        name.className = "game-library__name";
        name.textContent = game.name;

        const platforms = document.createElement("small");
        platforms.className = "game-library__platforms";

        platforms.textContent =
            Array.isArray(game.platforms)
                ? game.platforms.join(" / ")
                : platform;

        info.append(name, platforms);

        card.appendChild(info);

        return card;
    }


    /* ========================================
       3. CARREGAR BIBLIOTECA
    ======================================== */

    async function loadLibrary(id) {

        const library = libraries[id];

        if (
            !library?.track ||
            !library.status ||
            !library.count
        ) {
            console.warn(
                `PG Reality: painel ${id} incompleto.`
            );
            return;
        }

        try {

            const response = await fetch(
                library.file,
                { cache: "no-store" }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data.games)) {
                throw new Error("Lista de jogos inválida.");
            }

            const games = data.games.filter(
                game => typeof game.name === "string" &&
                        game.name.trim()
            );

            const fragment = document.createDocumentFragment();

            for (const game of games) {

                fragment.appendChild(
                    createGameCard(game, library.platform)
                );

            }

            library.track.replaceChildren(fragment);

            library.count.textContent =
                `${games.length} JOGOS`;

            library.status.textContent = games.length
                ? "Explore os jogos da minha biblioteca."
                : "Nenhum jogo encontrado.";

            document.querySelectorAll(
                `[data-library-nav="${id}"]`
            ).forEach(button => {
                button.disabled = games.length <= 1;
            });

            console.log(
                `PG Reality: ${games.length} jogos carregados em ${id}.`
            );

        } catch (error) {

            console.error(
                `Erro na biblioteca ${id}:`,
                error
            );

            library.status.textContent =
                "Não foi possível carregar esta biblioteca.";

        }

    }


    /* ========================================
       4. CONTROLES DOS CARROSSÉIS
    ======================================== */

    document.querySelectorAll(
        "[data-library-nav]"
    ).forEach(button => {

        button.addEventListener("click", () => {

            const id = button.dataset.libraryNav;
            const direction = Number(
                button.dataset.direction
            );

            const track = libraries[id]?.track;

            if (!track) return;

            track.scrollBy({
                left: direction * track.clientWidth * 0.8,
                behavior: "smooth"
            });

        });

    });


    /* ========================================
       5. INICIALIZAÇÃO
    ======================================== */

    loadLibrary("psn");
    loadLibrary("steam");

    // Na próxima etapa, após criarmos steam-library.json,
    // ativaremos também:
    //
    // loadLibrary("steam");

});