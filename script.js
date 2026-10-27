document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Tlačítko Kopírovat u každého bloku kódu ---------- */
    document.querySelectorAll("pre").forEach(function (pre) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "copy-btn";
        button.textContent = "Kopírovat";

        button.addEventListener("click", function () {
            const text = pre.querySelector("code")?.innerText ?? pre.innerText;
            navigator.clipboard.writeText(text).then(function () {
                button.textContent = "Zkopírováno";
                button.classList.add("is-done");
                setTimeout(function () {
                    button.textContent = "Kopírovat";
                    button.classList.remove("is-done");
                }, 1600);
            }).catch(function () {
                button.textContent = "Nelze kopírovat";
            });
        });

        pre.appendChild(button);
    });

    /* ---------- Zvýraznění aktuální sekce v obsahu ---------- */
    const tocLinks = document.querySelectorAll(".toc a");
    const sections = document.querySelectorAll("main section[id]");

    if ("IntersectionObserver" in window && tocLinks.length) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                tocLinks.forEach(function (link) {
                    const active = link.getAttribute("href") === "#" + entry.target.id;
                    link.classList.toggle("is-active", active);
                    if (active) link.setAttribute("aria-current", "true");
                    else link.removeAttribute("aria-current");
                });
            });
        }, { rootMargin: "-20% 0px -70% 0px" });

        sections.forEach(function (section) { observer.observe(section); });
    }

    /* ---------- Chybějící screenshot: ukáže, jaký soubor doplnit ---------- */
    document.querySelectorAll(".shot img").forEach(function (img) {
        function showPlaceholder() {
            const box = document.createElement("div");
            box.className = "shot-missing";
            const text = document.createElement("span");
            text.textContent = "Sem patří screenshot: " + img.alt;
            const file = document.createElement("code");
            file.textContent = img.getAttribute("src");
            box.append(text, file);
            img.replaceWith(box);
        }
        if (img.complete && img.naturalWidth === 0) showPlaceholder();
        else img.addEventListener("error", showPlaceholder);
    });

    /* ---------- Zvětšení obrázku ---------- */
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    let lastFocused = null;

    function openLightbox(img) {
        lastFocused = document.activeElement;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        const caption = img.closest("figure")?.querySelector("figcaption");
        lightboxCaption.textContent = (caption ? caption.textContent : img.alt) +
            " (kliknutím na obrázek zobrazíš detail)";
        lightbox.classList.remove("is-zoomed");
        lightboxImg.style.width = "";
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
        closeBtn.focus();
    }

    /* Kliknutí na obrázek přepíná mezi celým obrázkem a detailem */
    lightboxImg.addEventListener("click", function (event) {
        if (lightbox.classList.contains("is-zoomed")) {
            lightbox.classList.remove("is-zoomed");
            lightboxImg.style.width = "";
            return;
        }
        const rect = lightboxImg.getBoundingClientRect();
        const ratioX = (event.clientX - rect.left) / rect.width;
        const ratioY = (event.clientY - rect.top) / rect.height;
        const zoomWidth = Math.max(lightboxImg.naturalWidth, rect.width * 2);

        lightbox.classList.add("is-zoomed");
        lightboxImg.style.width = zoomWidth + "px";

        // Posune pohled tak, aby místo, kam uživatel klikl, bylo uprostřed
        lightbox.scrollLeft = ratioX * lightboxImg.offsetWidth - lightbox.clientWidth / 2;
        lightbox.scrollTop = ratioY * lightboxImg.offsetHeight - lightbox.clientHeight / 2;
    });

    function closeLightbox() {
        lightbox.classList.remove("is-zoomed");
        lightboxImg.style.width = "";
        lightbox.hidden = true;
        lightboxImg.src = "";
        document.body.style.overflow = "";
        if (lastFocused) lastFocused.focus();
    }

    document.addEventListener("click", function (event) {
        const img = event.target.closest(".zoomable");
        if (img) openLightbox(img);
    });

    document.querySelectorAll(".zoomable").forEach(function (img) {
        img.tabIndex = 0;
        img.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(img);
            }
        });
    });

    closeBtn.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
});