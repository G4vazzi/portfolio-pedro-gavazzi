"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    const list = document.getElementById("psnPlatinumList");
    const total = document.getElementById("psnPlatinumCount");
    const status = document.getElementById("psnTrophyStatus");
    const profileLink = document.getElementById("psnProfileLink");

    if (!list || !total || !status || !profileLink) {
        return;
    }

    function validHttpsUrl(value) {
        try {
            const url = new URL(value);
            return url.protocol === "https:";
        } catch {
            return false;
        }
    }

    function formatDate(value) {
        if (!value) return "Data não disponível";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Data não disponível";
        }

        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    function createTrophyCard(trophy) {

        const card = document.createElement("div");
        card.className = "psn-trophy";

        const image = document.createElement("img");
        image.className = "psn-trophy__image";
        image.alt = `Ícone de ${trophy.name}`;
        image.loading = "lazy";

        const placeholder = document.createElement("div");
        placeholder.className = "psn-trophy__placeholder";
        placeholder.textContent = "★";
        placeholder.setAttribute("aria-hidden", "true");

        if (validHttpsUrl(trophy.iconUrl)) {
            image.src = trophy.iconUrl;

            image.onerror = () => {
                image.replaceWith(placeholder);
            };

            card.appendChild(image);
        } else {
            card.appendChild(placeholder);
        }

        const info = document.createElement("div");
        info.className = "psn-trophy__info";

        const name = document.createElement("strong");
        name.textContent = trophy.name;

        const date = document.createElement("small");
        date.textContent =
            `Platina conquistada em ${formatDate(trophy.earnedAt)}`;

        info.append(name, date);

        const icon = document.createElement("span");
        icon.className = "psn-trophy__icon";
        icon.textContent = "★";
        icon.setAttribute("aria-hidden", "true");

        card.append(info, icon);

        return card;
    }

    try {

        const response = await fetch(
            "data/psn-trophies.json",
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Arquivo de troféus indisponível");
        }

        const data = await response.json();

        total.textContent =
            Number.isFinite(data.platinumCount)
                ? data.platinumCount
                : "—";

        const trophies = Array.isArray(data.platinums)
            ? data.platinums.slice(0, 5)
            : [];

        list.replaceChildren(
            ...trophies.map(createTrophyCard)
        );

        if (trophies.length === 0) {
            status.textContent =
                "Nenhuma platina sincronizada ainda.";
        } else {
            status.textContent = data.updatedAt
                ? `Última sincronização: ${formatDate(data.updatedAt)}`
                : "Dados sincronizados da PSN";
        }

        if (validHttpsUrl(data.profileUrl)) {
            profileLink.href = data.profileUrl;
            profileLink.hidden = false;
        }

    } catch (error) {

        console.warn("PSN:", error.message);

        status.textContent =
            "Aguardando a primeira sincronização da PlayStation.";

    }

});