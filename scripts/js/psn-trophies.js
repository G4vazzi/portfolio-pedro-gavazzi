"use strict";

console.log("[PSN] Script carregado.");

async function carregarPlatinas() {

    const lista = document.getElementById("psnPlatinumList");
    const total = document.getElementById("psnPlatinumCount");
    const nivel = document.getElementById("psnTrophyLevel");
    const status = document.getElementById("psnTrophyStatus");

    // A lista é o único elemento obrigatório.
    if (!lista) {
        console.error(
            "[PSN] Não encontrei o elemento #psnPlatinumList."
        );
        return;
    }

    if (status) {
        status.textContent = "Carregando conquistas...";
    }

    try {

        const resposta = await fetch(
            "./data/psn-trophies.json",
            { cache: "no-store" }
        );

        if (!resposta.ok) {
            throw new Error("HTTP " + resposta.status);
        }

        const dados = await resposta.json();

        console.log("[PSN] JSON carregado:", dados.platinums?.length);

        if (total) {
            total.textContent = dados.platinumCount ?? "—";
        }

        if (nivel) {
            nivel.textContent = dados.trophyLevel ?? "—";
        }

        const platinas = Array.isArray(dados.platinums)
            ? dados.platinums.slice(0, 5)
            : [];

        lista.replaceChildren();

        for (const platina of platinas) {

            const card = document.createElement("div");
            card.className = "psn-trophy";

            const imagem = document.createElement("img");
            imagem.className = "psn-trophy__image";
            imagem.alt = platina.name || "Jogo PlayStation";
            imagem.loading = "lazy";

            if (platina.iconUrl) {
                imagem.src = platina.iconUrl;

                imagem.onerror = () => {
                    const reserva = document.createElement("div");
                    reserva.className = "psn-trophy__placeholder";
                    reserva.textContent = "★";
                    imagem.replaceWith(reserva);
                };

                card.appendChild(imagem);
            }

            const informacoes = document.createElement("div");
            informacoes.className = "psn-trophy__info";

            const nome = document.createElement("strong");
            nome.textContent = platina.name || "Jogo desconhecido";

            const data = document.createElement("small");
            const dataConquista = new Date(platina.earnedAt);

            const dataFormatada = Number.isNaN(dataConquista.getTime())
                ? "Indisponível"
                : dataConquista.toLocaleDateString("pt-BR", {
                    timeZone: "America/Sao_Paulo"
                });

            data.textContent = "Platina: " + dataFormatada;

            const plataforma = document.createElement("small");
            plataforma.textContent = platina.platform || "PlayStation";

            informacoes.append(nome, data, plataforma);

            const trofeu = document.createElement("span");
            trofeu.className = "psn-trophy__icon";
            trofeu.textContent = "★";

            card.append(informacoes, trofeu);
            lista.appendChild(card);
        }

        if (status) {
            status.textContent =
                `${platinas.length} platinas carregadas com sucesso.`;
        }

        console.log("[PSN] Cards criados:", lista.children.length);

    } catch (erro) {

        console.error("[PSN] Erro:", erro);

        if (status) {
            status.textContent =
                "Erro ao carregar os troféus.";
        }
    }
}

// Funciona mesmo se o DOM já estiver carregado.
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        carregarPlatinas
    );
} else {
    carregarPlatinas();
}