document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // CARROSSEL
    // ==============================

    const carousel = document.querySelector(".project-carousel");

    if (carousel) {

        const slides = carousel.querySelectorAll(".carousel-slide");
        const btnAnterior = carousel.querySelector(".carousel-prev");
        const btnProximo = carousel.querySelector(".carousel-next");
        const indicadores = carousel.querySelectorAll(".carousel-indicator");

        let slideAtual = 0;

        function mostrarSlide(index) {

            if (index >= slides.length) {
                slideAtual = 0;
            } else if (index < 0) {
                slideAtual = slides.length - 1;
            } else {
                slideAtual = index;
            }

            slides.forEach((slide, i) => {
                slide.classList.toggle("active", i === slideAtual);
            });

            indicadores.forEach((indicador, i) => {
                indicador.classList.toggle("active", i === slideAtual);
            });
        }

        btnProximo.addEventListener("click", () => {
            mostrarSlide(slideAtual + 1);
        });

        btnAnterior.addEventListener("click", () => {
            mostrarSlide(slideAtual - 1);
        });

        indicadores.forEach((indicador, index) => {

            indicador.addEventListener("click", () => {
                mostrarSlide(index);
            });

        });

        mostrarSlide(0);
    }


    // ==============================
    // MODAL / LIGHTBOX
    // ==============================

    const modal = document.querySelector(".image-modal");
    const modalImagem = document.querySelector(".image-modal img");
    const modalFechar = document.querySelector(".modal-close");

    const imagensProjeto = document.querySelectorAll(".carousel-slide img");

    if (modal && modalImagem) {

        imagensProjeto.forEach(imagem => {

            imagem.addEventListener("click", () => {

                modalImagem.src = imagem.src;
                modalImagem.alt = imagem.alt;

                modal.classList.add("active");

                document.body.classList.add("modal-open");

            });

        });


        function fecharModal() {

            modal.classList.remove("active");

            document.body.classList.remove("modal-open");

        }


        modalFechar.addEventListener("click", fecharModal);


        modal.addEventListener("click", (event) => {

            if (event.target === modal) {
                fecharModal();
            }

        });


        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {
                fecharModal();
            }

        });

    }

});