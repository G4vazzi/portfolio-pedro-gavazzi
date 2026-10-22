"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       1. ELEMENTOS PRINCIPAIS
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

    if (
        !intro || !app || !skipIntro ||
        !breakReality || !replayIntro ||
        !introSystem || !menu || !screenCounter ||
        !menuButtons.length
    ) {
        console.error(
            "PG Reality: faltam elementos principais no HTML."
        );
        return;
    }

    let introTimers = [];


    /* ========================================
       2. TEMPORIZADORES E SESSÃO
    ======================================== */

    function clearIntroTimers() {
        introTimers.forEach(clearTimeout);
        introTimers = [];
    }

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
            // Continua funcionando sem armazenamento.
        }
    }


    /* ========================================
       3. MENU PRINCIPAL E CÂMERA
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
            `${String(index + 1).padStart(2, "0")} / ` +
            `${String(menuButtons.length).padStart(2, "0")}`;

        // Movimenta o cenário conforme a seção.
        document.body.dataset.screen = screen;
    }

    menuButtons.forEach(button => {

        button.addEventListener("click", () => {
            openScreen(button.dataset.screen);
        });

    });

    document.querySelectorAll("[data-go]").forEach(button => {

        button.addEventListener("click", () => {

            const screen = button.dataset.go;

            openScreen(screen);

            menuButtons.find(
                item => item.dataset.screen === screen
            )?.focus({ preventScroll: true });
        });

    });

    menu.addEventListener("keydown", event => {

        if (
            event.key !== "ArrowUp" &&
            event.key !== "ArrowDown"
        ) return;

        const current = menuButtons.indexOf(
            document.activeElement
        );

        if (current === -1) return;

        event.preventDefault();

        const direction =
            event.key === "ArrowDown" ? 1 : -1;

        const nextIndex = (
            current + direction + menuButtons.length
        ) % menuButtons.length;

        const nextButton = menuButtons[nextIndex];

        nextButton.focus();
        openScreen(nextButton.dataset.screen);
    });


    /* ========================================
       4. INTRODUÇÃO CINEMATOGRÁFICA
    ======================================== */

    function finishIntro() {

        if (
            intro.hidden ||
            intro.classList.contains("is-exiting")
        ) return;

        clearIntroTimers();

        breakReality.disabled = true;
        markIntroSeen();

        intro.classList.remove(
            "is-glitching",
            "is-ready"
        );

        function releaseInterface() {

            intro.hidden = true;

            intro.classList.remove("is-exiting");

            app.inert = false;

            document.body.classList.remove(
                "intro-running"
            );

            menuButtons.find(
                button => button.classList.contains("is-active")
            )?.focus({ preventScroll: true });
        }

        if (reducedMotion.matches) {
            releaseInterface();
            return;
        }

        // Desaparecimento suave da introdução.
        intro.classList.add("is-exiting");

        // Revelação cinematográfica do menu.
        app.classList.add("is-revealing");

        introTimers.push(
            setTimeout(releaseInterface, 700)
        );
    }


    function showBreakButton() {

        if (intro.hidden) return;

        intro.classList.add("is-ready");

        breakReality.disabled = false;

        breakReality.focus({
            preventScroll: true
        });
    }


    function startIntro(force = false) {

        clearIntroTimers();

        intro.classList.remove(
            "is-exiting",
            "is-ready",
            "is-glitching"
        );

        app.classList.remove("is-revealing");

        if (!force && hasSeenIntro()) {

            intro.hidden = true;
            app.inert = false;

            document.body.classList.remove(
                "intro-running"
            );

            return;
        }

        introSystem.textContent =
            "SIGNAL LOST // RECONSTRUCTING REALITY";

        intro.hidden = false;
        breakReality.disabled = true;

        app.inert = true;

        document.body.classList.add(
            "intro-running"
        );

        skipIntro.focus({
            preventScroll: true
        });

        if (reducedMotion.matches) {

            showBreakButton();

        } else {

            introTimers.push(
                setTimeout(showBreakButton, 3000)
            );

        }
    }


    function breakRealityNow() {

        if (
            intro.hidden ||
            !intro.classList.contains("is-ready") ||
            intro.classList.contains("is-glitching")
        ) return;

        breakReality.disabled = true;

        if (reducedMotion.matches) {
            finishIntro();
            return;
        }

        introSystem.textContent =
            "REALITY LAYER CORRUPTED // ACCESS GRANTED";

        intro.classList.add("is-glitching");

        introTimers.push(
            setTimeout(finishIntro, 1400)
        );
    }


    // Botões da introdução.

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

    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") return;

        if (!intro.hidden) {

            finishIntro();

        } else {

            openScreen("inicio");
            menuButtons[0].focus();

        }
    });


    /* ========================================
       5. BANCO DE DADOS DOS PROJETOS
    ======================================== */

    const projectCatalog = {

        spaco: {
            number: "01",
            name: "SpacoContabil",

            description:
                "Site institucional com ferramentas digitais, " +
                "calculadoras financeiras, serviços contábeis " +
                "e integrações com APIs.",

            technologies: [
                "Python", "Flask", "JavaScript",
                "HTML", "CSS"
            ],

            page: "projects/spacocontabil.html",

            mockupDomain: "spacocontabil.com.br",
            mockupTitle: "SpacoContabil",
            mockupCaption: "Soluções para seu negócio",

            image: ""
        },

        lanchonete: {
            number: "02",
            name: "LanchoneteWeb",

            description:
                "Sistema de uma lanchonete com cardápio, " +
                "carrinho de compras, checkout e " +
                "painel administrativo.",

            technologies: [
                "Python", "Flask", "SQLite",
                "HTML", "CSS"
            ],

            page: "projects/lanchoneteweb.html",

            mockupDomain: "lanchoneteweb.dev",
            mockupTitle: "Hot Dog Lanchonete",
            mockupCaption: "Faça seu pedido online",

            image: ""
        }

    };

    /* ========================================
       6. SISTEMA DE MISSÕES
    ======================================== */

    function initializeMissions() {

        const projectChoices = document.getElementById(
            "projectChoices"
        );

        const projectButtons = [
            ...document.querySelectorAll(
                ".project-choice[data-project]"
            )
        ];

        const detail = document.getElementById("projectDetail");
        const art = document.getElementById("projectArt");

        const image = document.getElementById("projectImage");
        const mockup = document.getElementById("projectMockup");

        const index = document.getElementById("projectIndex");
        const title = document.getElementById("projectTitle");

        const description = document.getElementById(
            "projectDescription"
        );

        const stack = document.getElementById("projectStack");
        const link = document.getElementById("projectLink");

        const mockupDomain = document.getElementById(
            "projectMockupDomain"
        );

        const mockupTitle = document.getElementById(
            "projectMockupTitle"
        );

        const mockupCaption = document.getElementById(
            "projectMockupCaption"
        );

        const required = [
            projectChoices, detail, art, image,
            mockup, index, title, description,
            stack, link, mockupDomain,
            mockupTitle, mockupCaption
        ];

        if (
            required.some(element => !element) ||
            !projectButtons.length
        ) {
            console.warn(
                "PG Reality: seção de missões incompleta no HTML."
            );
            return;
        }

        let imageVersion = 0;


        /* ========================================
           CARREGAR IMAGEM DO PROJETO
        ======================================== */

        function loadProjectImage(path) {

            const version = ++imageVersion;

            image.hidden = true;
            mockup.hidden = false;

            image.removeAttribute("src");

            if (!path) return;

            const loader = new Image();

            loader.onload = () => {

                if (version !== imageVersion) return;

                image.src = loader.src;
                image.hidden = false;

                mockup.hidden = true;
            };

            loader.onerror = () => {

                if (version !== imageVersion) return;

                image.hidden = true;
                mockup.hidden = false;
            };

            loader.src = path;
        }


        /* ========================================
           SELECIONAR MISSÃO
        ======================================== */

        function selectMission(id, animate = true) {

            const project = projectCatalog[id];

            if (!project) return;

            projectButtons.forEach(button => {

                const selected =
                    button.dataset.project === id;

                button.classList.toggle(
                    "is-selected",
                    selected
                );

                button.setAttribute(
                    "aria-pressed",
                    String(selected)
                );
            });

            index.textContent =
                `MISSION ${project.number} / ` +
                `${String(projectButtons.length).padStart(2, "0")}`;

            title.textContent = project.name;
            description.textContent = project.description;

            link.href = project.page;

            art.dataset.project = id;

            mockupDomain.textContent = project.mockupDomain;
            mockupTitle.textContent = project.mockupTitle;
            mockupCaption.textContent = project.mockupCaption;

            const tags = document.createDocumentFragment();

            project.technologies.forEach(technology => {

                const tag = document.createElement("span");

                tag.textContent = technology;

                tags.appendChild(tag);
            });

            stack.replaceChildren(tags);

            loadProjectImage(project.image);

            // Reinicia a animação do projeto.

            detail.classList.remove("is-updating");

            if (animate && !reducedMotion.matches) {

                void detail.offsetWidth;

                detail.classList.add("is-updating");
            }
        }


        /* ========================================
           CLIQUES NAS MISSÕES
        ======================================== */

        projectButtons.forEach(button => {

            button.addEventListener("click", () => {

                selectMission(
                    button.dataset.project
                );

            });

        });


        /* ========================================
           NAVEGAÇÃO POR TECLADO
        ======================================== */

        projectChoices.addEventListener(
            "keydown",
            event => {

                const keys = [
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight"
                ];

                if (!keys.includes(event.key)) return;

                const current = projectButtons.indexOf(
                    document.activeElement
                );

                if (current === -1) return;

                event.preventDefault();

                const direction = (
                    event.key === "ArrowDown" ||
                    event.key === "ArrowRight"
                ) ? 1 : -1;

                const nextIndex = (
                    current +
                    direction +
                    projectButtons.length
                ) % projectButtons.length;

                const nextButton = projectButtons[nextIndex];

                nextButton.focus();

                selectMission(
                    nextButton.dataset.project
                );
            }
        );

        // Carrega a primeira missão.
        selectMission("spaco", false);
        
    }

    /* ========================================
    7. SKILL TREE - SISTEMA DE HABILIDADES
    ======================================== */

    function initializeSkillTree() {

        const tree = document.getElementById("skillTree");

        if (!tree) {
            console.warn(
                "PG Reality: árvore de habilidades não encontrada."
            );
            return;
        }

        const skillButtons = [
            ...tree.querySelectorAll(".skill-node[data-skill]")
        ];

        console.log(
            "PG Reality - Habilidades encontradas: ",
            skillButtons.length
        );

        const category = document.getElementById("skillCategory");
        const title = document.getElementById("skillName");
        const description = document.getElementById("skillDescription");
        const usage = document.getElementById("skillUsage");
        const projects = document.getElementById("skillProjects");
        const link = document.getElementById("skillLink");
        const linkLabel = document.getElementById("skillLinkLabel");

        if (
            !skillButtons.length ||
            [category, title, description, usage, projects, link, linkLabel]
                .some(element => !element)
        ) {
            console.warn(
                "PG Reality: elementos da árvore de habilidades incompletos."
            );
            return;
        }


        /* ========================================
        DADOS DAS HABILIDADES
        ======================================== */

        const skillCatalog = {

            python: {
                category: "DESENVOLVIMENTO WEB",
                title: "Python",
                description:
                    "Linguagem que utilizo para desenvolver " +
                    "aplicações e implementar regras de negócio.",
                usage:
                    "Rotas, validações e processamento de dados " +
                    "em aplicações web.",
                projects: ["SpacoContabil", "LanchoneteWeb"],
                href: "projects/spacocontabil.html",
                external: false
            },

            flask: {
                category: "DESENVOLVIMENTO WEB",
                title: "Flask",
                description:
                    "Framework Python que utilizo para estruturar " +
                    "o backend de sistemas web.",
                usage:
                    "Organização de rotas, formulários, templates " +
                    "e integrações com banco de dados.",
                projects: ["SpacoContabil", "LanchoneteWeb"],
                href: "projects/lanchoneteweb.html",
                external: false
            },

            javascript: {
                category: "DESENVOLVIMENTO WEB",
                title: "JavaScript",
                description:
                    "Criação de funcionalidades interativas " +
                    "no navegador.",
                usage:
                    "Calculadoras, menus dinâmicos e atualização " +
                    "de elementos sem recarregar a página.",
                projects: ["SpacoContabil", "PG Reality"],
                href: "projects/spacocontabil.html",
                external: false
            },

            htmlcss: {
                category: "DESENVOLVIMENTO WEB",
                title: "HTML & CSS",
                description:
                    "Estruturação e apresentação de interfaces " +
                    "para web.",
                usage:
                    "Layouts responsivos, componentes visuais, " +
                    "animações e navegação.",
                projects: ["SpacoContabil", "PG Reality"],
                href: "projects/spacocontabil.html",
                external: false
            },

            sql: {
                category: "DADOS",
                title: "SQL / SQLite",
                description:
                    "Consultas e organização de dados " +
                    "em bancos relacionais.",
                usage:
                    "Armazenamento e recuperação de produtos " +
                    "e pedidos no sistema da lanchonete.",
                projects: ["LanchoneteWeb"],
                href: "projects/lanchoneteweb.html",
                external: false
            },

            excel: {
                category: "DADOS",
                title: "Excel",
                description:
                    "Planilhas para controle, análise " +
                    "e visualização de informações.",
                usage:
                    "Indicadores financeiros, tabelas estruturadas " +
                    "e acompanhamento de operações.",
                projects: ["Controle financeiro em Excel"],
                href: "",
                external: false
            },

            powerquery: {
                category: "DADOS",
                title: "Power Query",
                description:
                    "Preparação e transformação de dados " +
                    "para análises.",
                usage:
                    "Importação, limpeza e consolidação " +
                    "das tabelas usadas nos indicadores.",
                projects: ["Tratamento de dados no Excel"],
                href: "",
                external: false
            },

            powerpivot: {
                category: "DADOS",
                title: "Power Pivot",
                description:
                    "Modelagem e relacionamento de tabelas " +
                    "para análises em Excel.",
                usage:
                    "Construção de modelos de dados " +
                    "e métricas para painéis financeiros.",
                projects: ["Modelagem de dados no Excel"],
                href: "",
                external: false
            },

            vba: {
                category: "FERRAMENTAS E AUTOMAÇÃO",
                title: "VBA",
                description:
                    "Automação de tarefas e processos " +
                    "dentro do Excel.",
                usage:
                    "Macros para cadastro, geração de parcelas " +
                    "e rotinas financeiras.",
                projects: ["Automações em Excel"],
                href: "",
                external: false
            },

            git: {
                category: "FERRAMENTAS E AUTOMAÇÃO",
                title: "Git & GitHub",
                description:
                    "Versionamento de código " +
                    "e organização dos projetos.",
                usage:
                    "Registro de alterações e publicação " +
                    "de repositórios de desenvolvimento.",
                projects: ["Repositórios no GitHub"],
                href: "https://github.com/G4vazzi",
                external: true
            }

        };


        /* ========================================
        SELECIONAR HABILIDADE
        ======================================== */

        function selectSkill(id) {

            const skill = skillCatalog[id];

            if (!skill) return;

            // Destaca o nó selecionado
            skillButtons.forEach(button => {

                const active = button.dataset.skill === id;

                button.classList.toggle(
                    "is-selected",
                    active
                );

                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );

            });

            // Atualiza as informações
            category.textContent = skill.category;
            title.textContent = skill.title;
            description.textContent = skill.description;
            usage.textContent = skill.usage;

            // Atualiza os projetos relacionados
            const fragment = document.createDocumentFragment();

            skill.projects.forEach(project => {

                const chip = document.createElement("span");

                chip.textContent = project;

                fragment.appendChild(chip);

            });

            projects.replaceChildren(fragment);

            // Atualiza o link
            link.hidden = !skill.href;
            link.href = skill.href;


            linkLabel.textContent = skill.external
                ? "VER REPOSITÓRIOS"
                : "VER PROJETO RELACIONADO";

            if (skill.external) {

                link.target = "_blank";
                link.rel = "noopener noreferrer";

            } else {

                link.removeAttribute("target");
                link.removeAttribute("rel");

            }

        }


        /* ========================================
        CLIQUES NAS HABILIDADES
        ======================================== */

        skillButtons.forEach(button => {

            button.addEventListener("click", () => {

                console.log(
                    "Habilidade selecionada: ",
                    button.dataset.skill
                );

                selectSkill(button.dataset.skill);

            });
        });

        /* ========================================
        NAVEGAÇÃO PELO TECLADO
        ======================================== */

        tree.addEventListener("keydown", event => {

            const directions = {
                ArrowRight: 1,
                ArrowDown: 1,
                ArrowLeft: -1,
                ArrowUp: -1
            };

            const direction = directions[event.key];

            if (!direction) return;

            const current = skillButtons.indexOf(
                document.activeElement
            );

            if (current === -1) return;

            event.preventDefault();

            const next = (
                current +
                direction +
                skillButtons.length
            ) % skillButtons.length;

            skillButtons[next].focus();

            selectSkill(
                skillButtons[next].dataset.skill
            );

        });


        /* ========================================
        HABILIDADE INICIAL
        ======================================== */

        selectSkill("python");

    };

    /* ========================================
    8. STORY MODE - MINHA HISTÓRIA
    ======================================== */

    function initializeStory() {

        const root = document.getElementById("storyMode");

        if (!root) {
            console.warn(
                "PG Reality: seção Minha História não encontrada."
            );
            return;
        }

        const chapterButtons = [
            ...root.querySelectorAll(".story-chapter[data-chapter]")
        ];

        const screen = document.getElementById("storyScreen");
        const stage = document.getElementById("storyStage");
        const title = document.getElementById("storyTitle");

        const description = document.getElementById(
            "storyDescription"
        );

        const milestone = document.getElementById(
            "storyMilestone"
        );

        const visualNumber = document.getElementById(
            "storyVisualNumber"
        );

        const visualCode = document.getElementById(
            "storyVisualCode"
        );

        const nextButton = document.getElementById("storyNext");

        const progressBar = document.getElementById(
            "storyProgressBar"
        );

        const progressText = document.getElementById(
            "storyProgressText"
        );

        const required = [
            screen, stage, title, description, milestone,
            visualNumber, visualCode, nextButton,
            progressBar, progressText
        ];

        if (
            !chapterButtons.length ||
            required.some(item => !item)
        ) {
            console.warn(
                "PG Reality: faltam elementos no HTML de Minha História."
            );
            return;
        }


        /* ========================================
        BANCO DE DADOS DOS CAPÍTULOS
        ======================================== */

        const chapters = [

            {
                id: "inicio",
                number: "01",
                title: "O início",

                description:
                    "Depois de concluir o ensino médio, comecei " +
                    "a descobrir qual caminho queria seguir. " +
                    "Minhas primeiras escolhas profissionais " +
                    "estavam ligadas à Engenharia Civil.",

                milestone: "Primeiros passos da jornada",

                code: "ORIGIN // FILE_01"
            },

            {
                id: "civil",
                number: "02",
                title: "Construindo experiência",

                description:
                    "Estudei Engenharia Civil por três anos e " +
                    "tive contato com o acompanhamento de obras " +
                    "e a organização de processos. Aprendi sobre " +
                    "planejamento, responsabilidade e atenção " +
                    "aos detalhes.",

                milestone: "Três anos de Engenharia Civil",

                code: "EXPERIENCE // FILE_02"
            },

            {
                id: "mudanca",
                number: "03",
                title: "Uma nova direção",

                description:
                    "Percebi que meu interesse estava na " +
                    "tecnologia. Migrei para a área da " +
                    "computação e passei a estudar programação, " +
                    "desenvolvimento de sistemas e bancos de dados.",

                milestone: "Transição para a computação",

                code: "RESTART // FILE_03"
            },

            {
                id: "atual",
                number: "04",
                title: "O capítulo atual",

                description:
                    "Hoje aplico o que aprendo em projetos " +
                    "como SpacoContabil, LanchoneteWeb e " +
                    "PG Reality, desenvolvendo " +
                    "soluções web, ferramentas e automações.",

                milestone: "Projetos reais e evolução constante",

                code: "ACTIVE QUEST // FILE_04"
            }

        ];


        /* ========================================
        CAPÍTULO ATUAL
        ======================================== */

        let currentIndex = 0;


        /* ========================================
        SELECIONAR CAPÍTULO
        ======================================== */

        function selectChapter(id, animate = true) {

            const index = chapters.findIndex(
                chapter => chapter.id === id
            );

            if (index === -1) return;

            currentIndex = index;

            const chapter = chapters[index];

            // Atualiza o capítulo selecionado
            chapterButtons.forEach(button => {

                const selected =
                    button.dataset.chapter === id;

                button.classList.toggle(
                    "is-selected",
                    selected
                );

                button.setAttribute(
                    "aria-pressed",
                    String(selected)
                );

            });

            // Atualiza informações
            screen.dataset.chapter = id;

            stage.textContent =
                `${chapter.number} / ${String(chapters.length).padStart(2, "0")}`;

            title.textContent = chapter.title;
            description.textContent = chapter.description;
            milestone.textContent = chapter.milestone;

            visualNumber.textContent = chapter.number;
            visualCode.textContent = chapter.code;

            // Atualiza o indicador de progresso
            progressBar.style.width =
                `${((index + 1) / chapters.length) * 100}%`;

            progressText.textContent =
                `CAPÍTULO ${chapter.number} DE ${String(chapters.length).padStart(2, "0")}`;

            // O último capítulo leva aos projetos
            nextButton.querySelector("span:first-child").textContent =
                index === chapters.length - 1
                    ? "EXPLORAR PROJETOS"
                    : "PRÓXIMO CAPÍTULO";

            // Reinicia a animação
            screen.classList.remove("is-transitioning");

            if (animate && !reducedMotion.matches) {

                void screen.offsetWidth;

                screen.classList.add("is-transitioning");

            }

        }


        /* ========================================
        CLIQUES NOS CAPÍTULOS
        ======================================== */

        chapterButtons.forEach(button => {

            button.addEventListener("click", () => {

                selectChapter(button.dataset.chapter);

            });

        });


        /* ========================================
        NAVEGAÇÃO PELO TECLADO
        ======================================== */

        root.addEventListener("keydown", event => {

            const keys = [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight"
            ];

            if (!keys.includes(event.key)) return;

            const current = chapterButtons.indexOf(
                document.activeElement
            );

            if (current < 0) return;

            event.preventDefault();

            const direction = (
                event.key === "ArrowDown" ||
                event.key === "ArrowRight"
            ) ? 1 : -1;

            const nextIndex = (
                current +
                direction +
                chapterButtons.length
            ) % chapterButtons.length;

            chapterButtons[nextIndex].focus();

            selectChapter(
                chapterButtons[nextIndex].dataset.chapter
            );

        });


        /* ========================================
        BOTÃO PRÓXIMO CAPÍTULO
        ======================================== */

        nextButton.addEventListener("click", () => {

            // No último capítulo, abre a seção Projetos
            if (currentIndex === chapters.length - 1) {

                openScreen("projetos");

                menuButtons.find(
                    button => button.dataset.screen === "projetos"
                )?.focus({ preventScroll: true });

                return;
            }

            // Avança para o próximo capítulo
            selectChapter(
                chapters[currentIndex + 1].id
            );

            chapterButtons[currentIndex].focus({
                preventScroll: true
            });

        });


        /* ========================================
        CAPÍTULO INICIAL
        ======================================== */

        selectChapter("inicio", false);

    };

    /* ========================================
    9. ALÉM DO CÓDIGO - PLAYER PROFILE
    ======================================== */

    function initializeOffCode() {

        const root = document.getElementById("offcodeRoot");

        if (!root) {
            console.warn(
                "PG Reality: perfil do jogador não encontrado."
            );
            return;
        }

        const options = document.getElementById("offcodeOptions");

        const buttons = [
            ...root.querySelectorAll(
                ".offcode-option[data-interest]"
            )
        ];

        const detail = document.getElementById("offcodeDetail");

        const indexLabel = document.getElementById("offcodeIndex");
        const visualNumber = document.getElementById("offcodeVisualNumber");
        const visualLabel = document.getElementById("offcodeVisualLabel");

        const category = document.getElementById("offcodeCategory");
        const title = document.getElementById("offcodeTitle");
        const description = document.getElementById("offcodeDescription");

        const highlights = document.getElementById("offcodeHighlights");

        const nextButton = document.getElementById("offcodeNext");
        const counter = document.getElementById("offcodeCounter");

        const required = [
            options, detail, indexLabel, visualNumber,
            visualLabel, category, title, description,
            highlights, nextButton, counter
        ];

        if (
            !buttons.length ||
            required.some(element => !element)
        ) {
            console.warn(
                "PG Reality: elementos do perfil incompletos."
            );
            return;
        }


        /* ========================================
        BANCO DE DADOS PESSOAIS
        ======================================== */

        const interests = {

            games: {
                category: "DIGITAL WORLDS",
                title: "Universos que me inspiram",

                description:
                    "Os videogames fazem parte da minha vida " +
                    "desde cedo. Gosto de jogar tanto no PC " +
                    "quanto no PlayStation 5, explorando " +
                    "mundos abertos, jogos competitivos " +
                    "e grandes histórias.",

                highlights: [],

                visual: "GAMING"
            },

            trofeus: {
                category: "ACHIEVEMENT SYSTEM",
                title: "A busca pelas platinas",

                description:
                    "Para mim, terminar um jogo é apenas " +
                    "parte da experiência. Gosto de completar " +
                    "desafios, conquistar troféus e explorar " +
                    "ao máximo os jogos que me interessam.",

                highlights: [],
                    
                visual: "TROPHY HUNTER"
            },

            futebol: {
                category: "FOOTBALL ARCHIVE",
                title: "Corinthians e futebol",

                description:
                    "Sou apaixonado por futebol e torcedor " +
                    "do Corinthians. É um dos meus interesses " +
                    "fora da tecnologia e dos videogames.",

                highlights: [
                    "Corinthians",
                    "Futebol",
                    "Torcida"
                ],

                visual: "FOOTBALL"
            },

            carros: {
                category: "AUTOMOTIVE INTEREST",
                title: "Paixão por carros",

                description:
                    "Carros também fazem parte dos meus " +
                    "interesses pessoais. Gosto de acompanhar " +
                    "esse universo e conhecer diferentes " +
                    "modelos e tecnologias.",

                highlights: [
                    "Carros",
                    "Design automotivo",
                    "Tecnologia"
                ],

                visual: "AUTOMOTIVE"
            },
            
        };


        /* ========================================
        CONTROLE DA SELEÇÃO
        ======================================== */

        const order = buttons.map(
            button => button.dataset.interest
        );

        let currentIndex = 0;


        function selectInterest(id, animate = true) {

            const interest = interests[id];

            if (!interest) return;

            const index = order.indexOf(id);

            if (index === -1) return;

            currentIndex = index;

            // Atualiza seleção
            buttons.forEach(button => {

                const selected =
                    button.dataset.interest === id;

                button.classList.toggle(
                    "is-selected",
                    selected
                );

                button.setAttribute(
                    "aria-pressed",
                    String(selected)
                );

            });

            // Atualiza dados
            detail.dataset.interest = id;

            const number = String(index + 1).padStart(2, "0");
            const total = String(order.length).padStart(2, "0");

            indexLabel.textContent =
                `PROFILE DATA // ${number}`;

            visualNumber.textContent = number;
            visualLabel.textContent = interest.visual;

            category.textContent = interest.category;
            title.textContent = interest.title;
            description.textContent = interest.description;

            counter.textContent = `${number} / ${total}`;

            // Atualiza destaques
            const fragment = document.createDocumentFragment();

            interest.highlights.forEach(item => {

                const span = document.createElement("span");

                span.textContent = item;

                fragment.appendChild(span);

            });

            highlights.replaceChildren(fragment);

            // Reinicia animação
            detail.classList.remove("is-switching");

            if (animate && !reducedMotion.matches) {

                void detail.offsetWidth;

                detail.classList.add("is-switching");

            }

        }


        /* ========================================
        CLIQUES NAS CATEGORIAS
        ======================================== */

        buttons.forEach(button => {

            button.addEventListener("click", () => {

                selectInterest(
                    button.dataset.interest
                );

            });

        });


        /* ========================================
        PRÓXIMO INTERESSE
        ======================================== */

        nextButton.addEventListener("click", () => {

            const nextIndex = (
                currentIndex + 1
            ) % order.length;

            selectInterest(order[nextIndex]);

        });


        /* ========================================
        NAVEGAÇÃO PELO TECLADO
        ======================================== */

        options.addEventListener("keydown", event => {

            const keys = [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight"
            ];

            if (!keys.includes(event.key)) return;

            const current = buttons.indexOf(
                document.activeElement
            );

            if (current === -1) return;

            event.preventDefault();

            const direction = (
                event.key === "ArrowDown" ||
                event.key === "ArrowRight"
            ) ? 1 : -1;

            const nextIndex = (
                current + direction + buttons.length
            ) % buttons.length;

            buttons[nextIndex].focus();

            selectInterest(
                buttons[nextIndex].dataset.interest
            );

        });


    /* ========================================
       ESTADO INICIAL
    ======================================== */

    selectInterest("games", false);

}
    


    /* ========================================
       7. INICIALIZAÇÃO GERAL
    ======================================== */

    openScreen("inicio");

    initializeMissions();

    initializeSkillTree();

    initializeStory();

    initializeOffCode();

    startIntro();

});