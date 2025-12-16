/* app.js — Complementos con:
  - tarjetas altas con media de fondo (YouTube o imagen local),
  - grilla 2×2 (CSS), scroll infinito (6 por página),
  - lazy-load de iframes YouTube de fondo (autoplay mute loop infinito),
  - autoplay/pause de videos HTML5 locales (si usas alguno),
  - “Detalles” abre modal con YouTube (solo ahí),
  - deep-link #p=slug y limpieza de hash al cerrar,
  - CTA “Obtener” con UTM. */


/* ============================ ================================
   0) DATA — Usa window.PRODUCTS si ya lo defines externamente.
============================================================ */
const PRODUCTS = (window.PRODUCTS && Array.isArray(window.PRODUCTS))
    ? window.PRODUCTS
    : [
        {
            slug: "google-earth-revit",
            title: "Earth en Revit",
            blurb: "Abre Earth en Revit. Superpone mapa satelital en vistas 2D o 3D y úsalo para calcar",
            tags: ["GIS", "Contexto", "Earth"],
            // Fondo YouTube en la tarjeta:
            ytBgUrl: "https://www.youtube.com/watch?v=KhbFADrtn7w",
            poster: "media/google-earth-revit.jpg",
            // Video SOLO en el modal Detalles (YouTube largo):
            videoUrl: "https://www.youtube.com/watch?v=KhbFADrtn7w",
            videoStart: 0,
        },
        {
            slug: "metrados-express",
            title: "Presupuestos Automáticos",
            blurb: "Mide elementos y exporta a Excel con un clic.",
            tags: ["Cubicación", "Productividad"],
            ytBgUrl: "https://www.youtube.com/watch?v=nls5JuhYhN4",
            poster: "media/metrados-express.jpg",
            videoUrl: "https://www.youtube.com/watch?v=nls5JuhYhN4",
        },
        {
            slug: "coordina-views",
            title: "Generación automática de pilares",
            blurb:
                "Dibuja el contorno, elige la densidad y el modo (perímetro, grilla o mixto) y exporta columnas estructurales listas para tu modelo.",
            tags: ["Estructura", "Ing", "Arq"],
            ytBgUrl: "https://www.youtube.com/watch?v=eb_sCt3lYzg",
            poster: "media/coordina-views.jpg",
            videoUrl: "https://www.youtube.com/watch?v=eb_sCt3lYzg",
        },
        {
            slug: "analisis-solar",
            title: "Análisis Solar + Térmico",
            blurb:
                "Visualiza incidencia solar en tu modelo y genera datos de radiación relativa para tu proyecto.",
            tags: ["Clima", "Visual", "EnergyPlus", "Python"],
            ytBgUrl: "https://www.youtube.com/watch?v=8VbwCOk8lzQ",
            poster: "media/analisis-solar.jpg",
            videoUrl: "https://www.youtube.com/watch?v=8VbwCOk8lzQ",
        },
    ];

// Añadir nuevas cartas al FINAL (pinceles + libreta)
PRODUCTS.push(
    {
        slug: "pinceles",
        title: "Pinceles",
        blurb:
            "Presets de visualización (líneas, grosores, colores) para vistas 2D/3D. Aplica y guarda estilos con un clic.",
        tags: ["Visualización", "Gráficos", "Revit"],
        poster: "media/pinceles.jpg",
        badges: ["Revit 2021–2025"],
    },
    {
        slug: "libreta",
        title: "Libreta",
        blurb:
            "Libreta asistente para cada una de las vistas del proyecto.",
        tags: ["IA", "Asistente", "Productividad"],
        poster: "media/deep-seek.jpg",
        badges: ["Beta", "Windows"],
    }
);

/* ============================================================
   0.1) DOCUMENTACIÓN POR APP (mini README para el modal)
============================================================ */
const DOCS = {
    "google-earth-revit": {
        overview:
            "Conecta tu modelo de Revit con el contexto real usando imágenes satelitales. Úsalo para ubicar proyectos, calcar vialidad y entender medianeros.",
        usage: [
            "Abre una vista 3D o de planta en Revit donde quieras trabajar con el contexto.",
            "En la pestaña \"Complementos\" o \"│ Estuche │\", ejecuta \"Earth en Revit\".",
            "Busca la ubicación de tu proyecto y ajusta la escala usando una medida conocida (por ejemplo el ancho de una calle).",
            "Bloquea la imagen y úsala como base para calcar topografía, platabandas, veredas y edificaciones vecinas."
        ],
        tips: [
            "Trabaja primero en una vista de trabajo para no sobrecargar tus planos de impresión.",
            "Mantén el área capturada acotada al entorno relevante para evitar que el archivo crezca demasiado."
        ]
    },
    "metrados-express": {
        overview:
            "Automatiza la cubicación de muros, losas y otros elementos del modelo y exporta los resultados a una planilla lista para presupuestar.",
        usage: [
            "Abre el modelo que quieras medir y verifica que los tipos y parámetros estén ordenados.",
            "Ejecuta \"Presupuestos Automáticos\" desde la pestaña de complementos.",
            "Elige las categorías a medir (muros, losas, vigas, etc.) y configura los filtros básicos.",
            "Genera la tabla de metrados y expórtala a Excel para vincularla con tu APU."
        ],
        tips: [
            "Define una plantilla de tipos (nombres consistentes) antes de medir para facilitar el resumen por partidas.",
            "Revisa las unidades del modelo (m, m², m³) para que coincidan con las de tu hoja de cálculo."
        ]
    },
    "coordina-views": {
        overview:
            "Crea pilares automáticos a partir de perímetros o grillas, con vista previa rápida para iterar alternativas estructurales.",
        usage: [
            "En planta, dibuja el perímetro o polígono base donde necesitas pilares.",
            "Ejecuta \"Pilares automáticos\" y selecciona el modo de generación: por perímetro, por grilla o mixto.",
            "Elige la familia de pilar, niveles de inicio y término y la separación deseada.",
            "Revisa la vista previa y confirma para que el complemento cree los pilares en el modelo."
        ],
        tips: [
            "Prueba primero en un modelo de prueba o en una copia de la vista para ajustar densidades.",
            "Usa filtros de vista para distinguir los pilares generados por el complemento del resto del modelo."
        ]
    },
    "analisis-solar": {
        overview:
            "Explora la incidencia solar y el comportamiento térmico aproximado de tu proyecto usando datos climáticos y visualizaciones sobre el modelo.",
        usage: [
            "Configura correctamente la ubicación, orientación y zona horaria del proyecto en Revit.",
            "Ejecuta \"Análisis Solar + Térmico\" sobre una vista 3D simplificada (masas o volúmenes).",
            "Selecciona el periodo de estudio (por ejemplo, solsticio de verano o invierno) y la franja horaria.",
            "Analiza el mapa de radiación relativa para tomar decisiones de aperturas, aleros y protecciones solares."
        ],
        tips: [
            "Utiliza modelos simplificados (masas o volúmenes) para iterar más rápido en etapas tempranas.",
            "Complementa estos resultados con un modelo energético detallado cuando estés en fase de diseño avanzado."
        ]
    },
    "pinceles": {
        overview:
            "Guarda combinaciones de estilos de vista (colores, grosores, patrones) como pinceles y aplícalas a otras vistas con un clic.",
        usage: [
            "En una vista base, ajusta gráficos, grosores de línea y colores hasta lograr el estilo que quieres.",
            "Abre \"Pinceles\" y crea un nuevo pincel a partir de esa vista.",
            "En otras vistas 2D o 3D, selecciona el pincel guardado y aplícalo para unificar el estilo.",
            "Ajusta y guarda variaciones para láminas de presentación, coordinación y revisión técnica."
        ],
        tips: [
            "Crea pinceles diferentes para cada fase (estudio preliminar, anteproyecto, ejecución).",
            "Evita aplicar demasiados filtros en un solo pincel para mantener los tiempos de regeneración razonables."
        ]
    },
    "libreta": {
        overview:
            "Asistente de IA enfocado en flujos AEC que te ayuda a buscar información, resumir documentos y proponer acciones dentro de tus proyectos.",
        install: [
            "Descarga el archivo .zip desde el botón \"Obtener\".",
            "Descomprime el contenido en una carpeta de tu elección.",
            "Ejecuta la aplicación de Deep seek o sigue las instrucciones del archivo README incluido.",
            "Si se ofrece integración con Revit u otras herramientas, sigue los pasos adicionales descritos en el README."
        ],
        usage: [
            "Abre Deep seek y vincula, si corresponde, las carpetas o proyectos con los que quieres trabajar.",
            "Formula preguntas concretas sobre tu modelo, normativa o documentación de proyecto.",
            "Usa las respuestas como apoyo para tomar decisiones, revisar criterios o generar documentación más rápido."
        ],
        tips: [
            "Cuanto más contexto le proporciones (planillas, PDFs, modelos), más útil será el asistente.",
            "Valida siempre los resultados frente a normativa y criterios profesionales antes de aplicar cambios en obra."
        ],
        requirements: [
            "Windows 10 u 11.",
            "Conexión estable a internet para las funciones de IA.",
            "Se recomienda al menos 8 GB de RAM."
        ]
    }
};

/* ============================================================
   1) SELECTORES
============================================================ */
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

const grid = $("#plugins .grid");
const modal = $("#modal");
const modalTitle = $("#modal-title");
const modalBody = $("#modal .modal-body");

/* ============================================================
   2) UTILS
============================================================ */
function youtubeIdFromUrl(u) {
    if (!u) return null;
    try {
        const url = new URL(u);
        if (url.searchParams.get("v")) return url.searchParams.get("v");
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "shorts" && parts[1]) return parts[1];
        if (parts[0] === "embed" && parts[1]) return parts[1];
        if (url.hostname.includes("youtu.be") && parts[0]) return parts[0];
    } catch {
        /* ignore */
    }
    return null;
}

function renderYouTube(id, title = "", start = 0) {
    const s =
        Number.isFinite(start) && start > 0 ? `&start=${Math.floor(start)}` : "";
    return `
    <div class="video-embed" role="group" aria-label="Demo en video">
      <iframe
        width="560" height="315"
        src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1&mute=1${s}"
        title="${(title || "Demo").replace(/"/g, "&quot;")}"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
  `;
}

function parseHash() {
    const m = location.hash.match(/[#?&]p=([a-z0-9-]+)/i);
    return m ? m[1] : null;
}

/* ============================================================
   3) MODAL DETALLES (YouTube + documentación)
============================================================ */
function openDetails(slug) {
    const p = PRODUCTS.find((x) => x.slug === slug);
    if (!p || !modal || !modalBody) return;

    const vid =
        (typeof p.videoId === "string" && p.videoId.length === 11 && p.videoId) ||
        youtubeIdFromUrl(p.videoUrl) ||
        null;
    const start = Number.isFinite(p.videoStart) ? p.videoStart : 0;

    const docs = DOCS[p.slug] || {};

    const overviewHTML = docs.overview
        ? `<section class="doc-block">
             <h4>¿Qué hace ${p.title}?</h4>
             <p>${docs.overview}</p>
           </section>`
        : "";

    const defaultInstallSteps = [
        "Descarga el archivo .zip desde el botón “Obtener”.",
        "Descomprime la carpeta en una ubicación accesible.",
        "Sigue el archivo README incluido para copiar los archivos a la carpeta de complementos (Addins) de Revit.",
        "Reinicia Revit y verifica que aparezca la pestaña correspondiente."
    ];
    const installSteps =
        Array.isArray(docs.install) && docs.install.length
            ? docs.install
            : defaultInstallSteps;
    const installHTML = `
        <section class="doc-block">
            <h4>Instalación</h4>
            <ol>${installSteps.map((s) => `<li>${s}</li>`).join("")}</ol>
        </section>
    `;

    const defaultUsageSteps = [
        "Abre Revit y carga un proyecto de ejemplo.",
        `En la pestaña "Complementos", ejecuta "${p.title}".`,
        "Prueba el flujo en un modelo pequeño antes de usarlo en producción."
    ];
    const usageSteps =
        Array.isArray(docs.usage) && docs.usage.length
            ? docs.usage
            : defaultUsageSteps;
    const usageHTML = `
        <section class="doc-block">
            <h4>Uso rápido</h4>
            <ol>${usageSteps.map((s) => `<li>${s}</li>`).join("")}</ol>
        </section>
    `;

    const tipsHTML =
        Array.isArray(docs.tips) && docs.tips.length
            ? `
        <section class="doc-block">
            <h4>Tips</h4>
            <ul>${docs.tips.map((s) => `<li>${s}</li>`).join("")}</ul>
        </section>`
            : "";

    const defaultReqItems = [
        "Windows 10 o superior.",
        "Revit instalado (según versión indicada en el README del complemento)."
    ];
    const reqItems =
        Array.isArray(docs.requirements) && docs.requirements.length
            ? docs.requirements
            : defaultReqItems;
    const reqHTML = `
        <section class="doc-block">
            <h4>Requisitos</h4>
            <ul>${reqItems.map((s) => `<li>${s}</li>`).join("")}</ul>
        </section>
    `;

    if (modalTitle) modalTitle.textContent = p.title;
    modalBody.innerHTML = `
        ${vid ? renderYouTube(vid, p.title, start) : ""}
        <div class="modal-doc">
            <p class="modal-intro">${p.blurb || ""}</p>
            ${overviewHTML}
            ${installHTML}
            ${usageHTML}
            ${tipsHTML}
            ${reqHTML}
        </div>
        <div class="stack row modal-actions" style="gap:.5rem;margin-top:.75rem;">
            <button class="btn btn-primary" data-action="get" data-slug="${p.slug}">Obtener</button>
            <button class="btn" id="btn-share" aria-label="Compartir">Compartir</button>
        </div>
        <p class="mono" style="opacity:.8;margin-top:.5rem;">
            Compatibilidad: ${p.badges?.filter((b) => b.startsWith("Revit")).join(", ") || "Revit"}.
        </p>
    `;

    modal.showDialog?.() ?? modal.showModal();
    history.replaceState(null, "", `#p=${slug}`);

    const share = $("#btn-share", modal);
    share?.addEventListener("click", async () => {
        const url = location.href;
        try {
            await navigator.clipboard.writeText(url);
            share.textContent = "¡Link copiado!";
            setTimeout(() => (share.textContent = "Compartir"), 1200);
        } catch {
            // fallback clásico
            // eslint-disable-next-line no-alert
            prompt("Copia este enlace:", url);
        }
    });
}

modal?.addEventListener("close", () => {
    const ifr = $("iframe", modalBody);
    if (ifr) ifr.remove();
    if (parseHash()) {
        history.replaceState(null, "", location.pathname + location.search);
    }
});

/* ============================================================
   4) TARJETAS: HTML (con YouTube de fondo) + SCROLL INFINITO
============================================================ */
const PAGE_SIZE = 6;
const state = {
    filtered: [],
    page: 0,
    pagerObs: null,
    vidsObs: null,
    ytObs: null,
};

function buildCardHTML(p) {
    // Preferimos YouTube de fondo si viene ytBgId/ytBgUrl
    const ytId = p.ytBgId || youtubeIdFromUrl(p.ytBgUrl);
    const hasYt = !!ytId;
    const hasPoster = !!p.poster;

    const body = `
    <div class="card-body">
      <div class="kicker">${p.tags?.join(" · ") || ""}</div>
      <h3>${p.title}</h3>
      <p>${p.blurb || ""}</p>
      <div class="badges">
        ${(p.badges || []).map((b) => `<span class="chip chip-muted">${b}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost" data-action="details" data-slug="${p.slug}">Detalles</button>
        <button class="btn btn-primary" data-action="get" data-slug="${p.slug}">Obtener</button>
      </div>
    </div>
  `;

    if (!hasYt && !hasPoster) return body;

    // Capa media: poster (fallback) + contenedor YT (se hidrata al entrar en viewport)
    const posterImg = hasPoster
        ? `<img class="poster" src="${p.poster}" alt="" aria-hidden="true" loading="lazy">`
        : "";
    const yt = hasYt
        ? `<div class="yt-bg" data-yt-id="${ytId}" data-start="${Number.isFinite(p.ytStart) ? p.ytStart : 0
        }" data-end="${Number.isFinite(p.ytEnd) ? p.ytEnd : ""}"></div>`
        : "";

    return `<div class="card-media" aria-hidden="true">${posterImg}${yt}</div>${body}`;
}

function appendCard(p) {
    const card = document.createElement("article");
    const hasYt = !!(p.ytBgId || youtubeIdFromUrl(p.ytBgUrl));
    const cls = hasYt ? "has-yt" : p.poster ? "has-media" : "";
    card.className = "card " + cls;
    card.setAttribute("role", "listitem");
    card.innerHTML = buildCardHTML(p);
    grid.appendChild(card);
}

function observeYouTubeBGs() {
    state.ytObs?.disconnect?.();
    const nodes = $$(".yt-bg", grid);
    if (!nodes.length) return;

    state.ytObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((en) => {
                const host = en.target;
                if (en.isIntersecting) {
                    if (!host.dataset.hydrated) {
                        const id = host.dataset.ytId;
                        const start = parseInt(host.dataset.start || "0", 10);
                        const end = host.dataset.end ? parseInt(host.dataset.end, 10) : null;
                        const base = `https://www.youtube.com/embed/${id}`;
                        const qs = new URLSearchParams({
                            autoplay: "1",
                            mute: "1",
                            controls: "0",
                            modestbranding: "1",
                            playsinline: "1",
                            rel: "0",
                            iv_load_policy: "3",
                            enablejsapi: "1",
                            loop: "1",
                            playlist: id,
                        });
                        if (start) qs.set("start", String(start));
                        if (Number.isFinite(end)) qs.set("end", String(end));
                        const ifr = document.createElement("iframe");
                        ifr.src = `${base}?${qs.toString()}`;
                        ifr.setAttribute("allow", "autoplay; encrypted-media");
                        ifr.setAttribute("title", "Preview");
                        ifr.setAttribute("tabindex", "-1");
                        ifr.setAttribute("loading", "lazy");
                        host.appendChild(ifr);
                        host.dataset.hydrated = "1";
                    }
                } else {
                    // Para ahorrar recursos, eliminamos el iframe cuando sale de vista
                    host.querySelector("iframe")?.remove();
                    host.dataset.hydrated = "";
                }
            });
        },
        { rootMargin: "200px" }
    );

    nodes.forEach((n) => state.ytObs.observe(n));
}

function observeCardVideos() {
    // Si alguna tarjeta usa <video> HTML5 local, seguimos soportándolo.
    state.vidsObs?.disconnect?.();
    const vids = $$("video[data-autoplay]", grid);
    if (!vids.length) return;

    state.vidsObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((en) => {
                const v = en.target;
                if (en.isIntersecting) {
                    v.play().catch(() => { });
                } else {
                    v.pause();
                    try {
                        v.currentTime = Math.min(v.currentTime, 0.1);
                    } catch {
                        /* ignore */
                    }
                }
            });
        },
        { rootMargin: "120px" }
    );

    vids.forEach((v) => state.vidsObs.observe(v));
}

function renderNextPage() {
    const start = state.page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const slice = state.filtered.slice(start, end);
    slice.forEach(appendCard);
    state.page++;

    // Hidratar fondos (YT y/o videos locales) para lo recién agregado
    observeYouTubeBGs();
    observeCardVideos();

    if (end >= state.filtered.length) {
        state.pagerObs?.disconnect?.();
        $("#pager-sentinel")?.remove();
    }
}

function setupPager() {
    const sentinel = document.createElement("div");
    sentinel.id = "pager-sentinel";
    sentinel.className = "hidden";
    grid.appendChild(sentinel);

    state.pagerObs?.disconnect?.();
    state.pagerObs = new IntersectionObserver(
        (entries) => {
            if (entries.some((e) => e.isIntersecting)) renderNextPage();
        },
        { rootMargin: "300px" }
    );

    state.pagerObs.observe(sentinel);
}

function renderCards(filter = "") {
    if (!grid) return;
    grid.innerHTML = "";

    const q = (filter || "").trim().toLowerCase();
    state.filtered = PRODUCTS.filter(
        (p) =>
            !q ||
            p.title.toLowerCase().includes(q) ||
            (p.blurb || "").toLowerCase().includes(q) ||
            (Array.isArray(p.tags) && p.tags.join(" ").toLowerCase().includes(q))
    );

    if (state.filtered.length === 0) {
        grid.innerHTML = `<p>No encontramos resultados para “${filter}”.</p>`;
        return;
    }

    state.page = 0;
    renderNextPage();
    setupPager();
}

/* ============================================================
   5) EVENTOS
============================================================ */
document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const slug = btn.getAttribute("data-slug");

    switch (action) {
        case "details":
            openDetails(slug);
            break;
        case "get": {
            const url = new URL(
                `downloads/${slug}.zip?utm_source=landing&utm_medium=cta&utm_campaign=estuche_andino`,
                window.location.href
            ).toString();
            window.location.href = url;
            break;
        }
    }
});

const searchInput = $('#plugins input[type="search"], #plugins .search input');
searchInput?.addEventListener("input", (e) => renderCards(e.target.value));

function openFromHash() {
    const slug = parseHash();
    if (slug) openDetails(slug);
}

window.addEventListener("hashchange", openFromHash);

/* ============================================================
   6) INIT COMPLEMENTOS
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    renderCards("");
    openFromHash();
});

/* ============================================================
   7) PORTAFOLIO: copiar correo + año
============================================================ */
function setupCopyEmail() {
    const btn = document.getElementById("copyEmail");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        const email = btn.dataset.email || "tucorreo@example.com";
        const original = btn.textContent;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(email);
            } else {
                const t = document.createElement("textarea");
                t.value = email;
                t.style.position = "fixed";
                t.style.opacity = "0";
                document.body.appendChild(t);
                t.select();
                document.execCommand("copy");
                document.body.removeChild(t);
            }
            btn.textContent = "Correo copiado ✓";
            setTimeout(() => {
                btn.textContent = original;
            }, 1500);
        } catch (e) {
            alert("Copia manualmente este correo: " + email);
        }
    });
}

function setupYears() {
    const year = new Date().getFullYear();
    const span1 = document.getElementById("y"); // footer Estuche Andino
    const span2 = document.getElementById("year"); // footer Portafolio
    if (span1) span1.textContent = year;
    if (span2) span2.textContent = year;
}

/* ============================================================
   8) PORTAFOLIO: carrusel de fotos de perfil
============================================================ */
function setupAvatarCarousel() {
    const circle = document.querySelector(".hero-card__avatar-circle");
    if (!circle) return;

    const img = circle.querySelector("img");
    if (!img) return;

    // Lee las rutas desde data-avatars en el HTML
    const raw = circle.dataset.avatars || "";
    const photos = raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    // Si no hay al menos 2 fotos, no tiene sentido rotar
    if (photos.length <= 1) return;

    let index = 0;
    img.src = photos[index];

    const INTERVAL = 4000; // 4 segundos entre fotos

    setInterval(() => {
        index = (index + 1) % photos.length;
        img.src = photos[index];
    }, INTERVAL);
}

/* ============================================================
   9) PORTAFOLIO: slider Formación / Experiencia
============================================================ */
function setupFormExpSlider() {
    const tabs = document.querySelectorAll(".slider-tab");
    const panels = document.querySelectorAll(".slider-panel");

    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.slide;
            if (!target) return;

            // Quitar estado activo de todos los tabs y paneles
            tabs.forEach((t) => t.classList.remove("is-active"));
            panels.forEach((p) => p.classList.remove("is-active"));

            // Activar tab clicado
            tab.classList.add("is-active");

            // Activar panel correspondiente
            const panel = document.querySelector(
                `.slider-panel[data-panel="${target}"]`
            );
            if (panel) {
                panel.classList.add("is-active");
            }
        });
    });
}

// Segundo listener de DOMContentLoaded solo para el portafolio
document.addEventListener("DOMContentLoaded", () => {
    setupCopyEmail();
    setupYears();
    setupAvatarCarousel();
    setupFormExpSlider();
});

