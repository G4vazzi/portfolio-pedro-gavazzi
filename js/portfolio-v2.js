"use strict";

/* ========================================
   PG REALITY - CONTROLE DA INTERFACE
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       ELEMENTOS DO SISTEMA
    ======================================== */

    const intro = document.getElementById("intro");
    const app = document.getElementById("app");

    const skipIntro = document.getElementById("skipIntro");
    const breakReality = document.getElementById("breakReality");
    const replayIntro = document.getElementById("replayIntro");

    const introSystem = document.querySelector(".intro__system");

    const menu = document.getElementById("gameMenu");
    const screenCounter = document.getElementById("screenCounter");

    const menuButtons = [
        ...document.querySelectorAll(".game-menu__item[data-screen]")
    ];

    const panels = [
        ...document.querySelectorAll(".panel[data-panel]")
    ];

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (!intro || !app || !skipIntro || !breakReality ||
        !replayIntro || !introSystem || !menu || !screenCounter) {
        console.error("PG Reality: falta um elemento necessário no HTML.");
        return;
    }

    let introTimers = [];


    /* ========================================
       GERENCIAMENTO DOS TEMPORIZADORES
    ======================================== */

    function clearIntroTimers() {

        introTimers.forEach(clearTimeout);

        introTimers = [];
    }


    /* ========================================
       CONTROLE DA SESSÃO
    ======================================== */

    function hasSeenIntro() {

        try {
            return sessionStorage.getItem("pg_intro_seen") === "1";
        } catch {
            return false;
        }

    }

    function markIntroSeen() {

        try {
            sessionStorage.setItem("pg_intro_seen", "1");
        } catch {
            // Continua funcionando sem sessionStorage.
        }

    }


    /* ========================================
       NAVEGAÇÃO ENTRE TELAS
    ======================================== */

    function openScreen(screen) {

        const selectedPanel = panels.find(
            panel => panel.dataset.panel === screen
        );

        if (!selectedPanel) return;

        menuButtons.forEach(button => {

            const active = button.dataset.screen === screen;

            button.classList.toggle("is-active", active);

            button.setAttribute(
                "aria-pressed",
                String(active)
            );

        });

        panels.forEach(panel => {
            panel.hidden = panel !== selectedPanel;
        });

        const index = menuButtons.findIndex(
            button => button.dataset.screen === screen
        );

        screenCounter.textContent =
            `${String(index + 1).padStart(2, "0")} / ${String(menuButtons.length).padStart(2, "0")}`;

    }

    /* ========================================
    FINALIZAR INTRODUÇÃO COM TRANSIÇÃO
    ======================================== */

    function finishIntro() {

        clearIntroTimers();

        breakReality.disabled = true;

        markIntroSeen();

        // Finaliza o glitch
        intro.classList.remove(
            "is-glitching",
            "is-ready"
        );

        // Respeita configurações de acessibilidade
        if (reducedMotion.matches) {

            intro.hidden = true;

            app.inert = false;

            document.body.classList.remove("intro-running");

            menuButtons.find(
                button => button.classList.contains("is-active")
            )?.focus({ preventScroll: true });

            return;
        }

        // Começa a desaparecer a realidade antiga
        intro.classList.add("is-exiting");

        // Inicia a construção visual do portfólio
        app.classList.add("is-revealing");

        // Aguarda a transição da introdução
        introTimers.push(
            setTimeout(() => {

                intro.hidden = true;

                intro.classList.remove("is-exiting");

                app.inert = false;

                document.body.classList.remove(
                    "intro-running"
                );

                const activeButton = menuButtons.find(
                    button => button.classList.contains("is-active")
                );

                activeButton?.focus({
                    preventScroll: true
                });

            }, 700)
        );

    }

    /* ========================================
       LIBERAR BOTÃO APÓS 3 SEGUNDOS
    ======================================== */

    function showBreakButton() {

        if (intro.hidden) return;

        intro.classList.add("is-ready");

        breakReality.disabled = false;

        breakReality.focus({
            preventScroll: true
        });

    }


    /* ========================================
       INICIAR INTRODUÇÃO
    ======================================== */

    function startIntro(force = false) {

        clearIntroTimers();

        // Reinicia os efeitos visuais
        intro.classList.remove("is-exiting");

        app.classList.remove("is-revealing");

        if (!force && hasSeenIntro()) {

            intro.hidden = true;
            app.inert = false;

            return;
        }

        // Restaura a mensagem inicial
        introSystem.textContent =
            "SIGNAL LOST // RECONSTRUCTING REALITY";

        // Mostra o cenário
        intro.hidden = false;

        intro.classList.remove(
            "is-ready",
            "is-glitching"
        );

        breakReality.disabled = true;
        replayIntro.disabled = false;

        app.inert = true;

        document.body.classList.add("intro-running");

        skipIntro.focus({
            preventScroll: true
        });

        // Libera o botão depois de 3 segundos
        // ou imediatamente com movimento reduzido.

        if (reducedMotion.matches) {

            showBreakButton();

        } else {

            introTimers.push(
                setTimeout(showBreakButton, 3000)
            );

        }

    }


    /* ========================================
       QUEBRAR A REALIDADE
    ======================================== */

    function breakRealityNow() {

        if (
            intro.hidden ||
            !intro.classList.contains("is-ready") ||
            intro.classList.contains("is-glitching")
        ) {
            return;
        }

        breakReality.disabled = true;

        // Respeita a preferência de movimento reduzido
        if (reducedMotion.matches) {

            finishIntro();
            return;

        }

        introSystem.textContent =
            "REALITY LAYER CORRUPTED // ACCESS GRANTED";

        // Ativa glitch, wireframe e scanner
        intro.classList.add("is-glitching");

        // Revela o portfólio após 1,4 segundo
        introTimers.push(
            setTimeout(finishIntro, 1400)
        );

    }


    /* ========================================
       CONTROLES DA INTRODUÇÃO
    ======================================== */

    breakReality.addEventListener(
        "click",
        breakRealityNow
    );

    skipIntro.addEventListener(
        "click",
        finishIntro
    );

    replayIntro.addEventListener("click", () => {

        startIntro(true);

    });


    /* ========================================
       CLIQUES NO MENU
    ======================================== */

    menuButtons.forEach(button => {

        button.addEventListener("click", () => {

            openScreen(button.dataset.screen);

        });

    });


    /* ========================================
       BOTÕES INTERNOS
    ======================================== */

    document.querySelectorAll("[data-go]").forEach(button => {

        button.addEventListener("click", () => {

            const screen = button.dataset.go;

            openScreen(screen);

            menuButtons.find(
                item => item.dataset.screen === screen
            )?.focus({ preventScroll: true });

        });

    });


    /* ========================================
       NAVEGAÇÃO PELO TECLADO
    ======================================== */

    menu.addEventListener("keydown", event => {

        if (
            event.key !== "ArrowUp" &&
            event.key !== "ArrowDown"
        ) {
            return;
        }

        const current = menuButtons.indexOf(
            document.activeElement
        );

        if (current === -1) return;

        event.preventDefault();

        const direction =
            event.key === "ArrowDown" ? 1 : -1;

        const next = (
            current +
            direction +
            menuButtons.length
        ) % menuButtons.length;

        menuButtons[next].focus();

        openScreen(
            menuButtons[next].dataset.screen
        );

    });


    /* ========================================
       TECLA ESC
    ======================================== */

    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") return;

        if (!intro.hidden) {

            finishIntro();

        } else {

            openScreen("inicio");

            menuButtons[0]?.focus();

        }

    });


    /* ========================================
       INICIALIZAÇÃO
    ======================================== */

    openScreen("inicio");

    startIntro();

});