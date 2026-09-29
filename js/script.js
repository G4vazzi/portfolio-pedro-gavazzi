// =====================================================
// MENU / NAVEGAÇÃO
// =====================================================

const navLinks = document.querySelectorAll(".nav a");

navLinks.forEach((link) => {
    link.addEventListener("click", () => {

        navLinks.forEach((item) => {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});


// =====================================================
// DESTAQUE DO MENU CONFORME A SEÇÃO
// =====================================================

const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach((section) => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.getAttribute("id");
        }

    });

    navLinks.forEach((link) => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

});


// =====================================================
// ANIMAÇÃO DOS ELEMENTOS
// =====================================================

const animatedElements = document.querySelectorAll(
    ".section-title, .about-content, .skill-card, .project-card, .contact-content"
);

const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.15
    }
);

animatedElements.forEach((element) => {
    element.classList.add("hidden");
    observer.observe(element);
});


// =====================================================
// ANO AUTOMÁTICO DO RODAPÉ
// =====================================================

const footerText = document.querySelector(".footer p");

if (footerText) {

    const currentYear = new Date().getFullYear();

    footerText.textContent =
        `© ${currentYear} Pedro Gavazzi. Todos os direitos reservados.`;

}