/* app.js — Complementos con:
   - tarjetas altas con media de fondo (YouTube o imagen local),
   - grilla 2×2 (CSS), scroll infinito (4 por página),
   - lazy-load de iframes YouTube de fondo (autoplay mute loop infinito),
   - autoplay/pause de videos HTML5 locales (si usas alguno),
   - “Detalles” abre modal con YouTube (solo ahí),
   - deep-link #p=slug y limpieza de hash al cerrar,
   - CTA “Obtener” con UTM. */













/* ============================================================
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
            ytBgUrl: "https://www.youtube.com/watch?v=8xvi4TOuXgg", // o ytBgId: "qcG-nZaud1g"
            poster: "media/google-earth-revit.jpg", // imagen fallback/previa
            // Video SOLO en el modal Detalles (YouTube largo):
            videoUrl: "https://www.youtube.com/watch?v=8xvi4TOuXgg",
            videoStart: 0
        },
        {
            slug: "metrados-express",
            title: "Presupuestos Automáticos",
            blurb: "Mide elementos y exporta a Excel con un clic.",
            tags: ["Cubicación", "Productividad"],
            ytBgUrl: "https://www.youtube.com/watch?v=nls5JuhYhN4",
            poster: "media/metrados-express.jpg",
            videoUrl: "https://www.youtube.com/watch?v=nls5JuhYhN4"
        },
        {
            slug: "coordina-views",
            title: "Pilares automáticos",
            blurb: "Genera pilares por perímetro, grilla o modo mixto desde un polígono dibujado; vista previa 3D y exportación a columnas.",
            tags: ["Estructura", "Ing"],
            ytBgUrl: "https://www.youtube.com/watch?v=eb_sCt3lYzg",
            poster: "media/coordina-views.jpg",
            videoUrl: "https://www.youtube.com/watch?v=eb_sCt3lYzg"
        },
        {
            slug: "analisis-solar",
            title: "Análisis Solar + Térmico",
            blurb: "Visualiza incidencia solar en tu modelo y genera datos de radiación relativa para tu proyecto.",
            tags: ["Clima", "Visual", "EnergyPlus", "Python"],

            ytBgUrl: "https://youtu.be/dQw4w9WgXcQ",
            poster: "media/analisis-solar.jpg",
            videoUrl: "https://youtu.be/dQw4w9WgXcQ"
        },


     




    ];

// Añadir nuevas cartas al FINAL (pinceles + deep seek)
PRODUCTS.push(
    {
        slug: "pinceles",
        title: "Pinceles",
        blurb: "Presets de visualización (líneas, grosores, colores) para vistas 2D/3D. Aplica y guarda estilos con un clic.",
        tags: ["Visualización", "Graficos", "Revit"],
        poster: "media/pinceles.jpg",
        // ytBgUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
        // videoUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
        badges: ["Revit 2021–2025"]
    },
    {
        slug: "deep-seek",
        title: "Deep seek",
        blurb: "Asistente IA para buscar, resumir y generar acciones rápidas dentro del flujo AEC.",
        tags: ["IA", "Asistente", "Productividad"],
        poster: "media/deep-seek.jpg",
        // ytBgUrl: "https://www.youtube.com/watch?v=YYYYYYYYYYY",
        // videoUrl: "https://www.youtube.com/watch?v=YYYYYYYYYYY",
        badges: ["Beta", "Windows"]
    }
);


/* ============================================================
   1) SELECTORES
============================================================ */
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

const grid = $('#plugins .grid');
const modal = $('#modal');
const modalTitle = $('#modal-title');
const modalBody = $('#modal .modal-body');

/* ============================================================
   2) UTILS
============================================================ */
function youtubeIdFromUrl(u) {
    if (!u) return null;
    try {
        const url = new URL(u);
        if (url.searchParams.get('v')) return url.searchParams.get('v');
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts[0] === 'shorts' && parts[1]) return parts[1];
        if (parts[0] === 'embed' && parts[1]) return parts[1];
        if (url.hostname.includes('youtu.be') && parts[0]) return parts[0];
    } catch { }
    return null;
}
function renderYouTube(id, title = "", start = 0) {
    const s = Number.isFinite(start) && start > 0 ? `&start=${Math.floor(start)}` : "";
    return `
    <div class="video-embed" role="group" aria-label="Demo en video">
      <iframe
        width="560" height="315"
        src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1&mute=1${s}"
        title="${(title || 'Demo').replace(/"/g, '&quot;')}"
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
   3) MODAL DETALLES (YouTube solo aquí)
============================================================ */
function openDetails(slug) {
    const p = PRODUCTS.find(x => x.slug === slug);
    if (!p || !modal || !modalBody) return;

    const vid = (typeof p.videoId === "string" && p.videoId.length === 11 && p.videoId)
        || youtubeIdFromUrl(p.videoUrl) || null;
    const start = Number.isFinite(p.videoStart) ? p.videoStart : 0;

    if (modalTitle) modalTitle.textContent = p.title;
    modalBody.innerHTML = `
    ${vid ? renderYouTube(vid, p.title, start) : ""}
    <p>${p.blurb || ""}</p>
    ${Array.isArray(p.features) ? `<ul>${p.features.map(f => `<li>${f}</li>`).join("")}</ul>` : ""}
    <div class="stack row" style="gap:.5rem;margin-top:.5rem;">
      <button class="btn btn-primary" data-action="get" data-slug="${p.slug}">Obtener</button>
      <button class="btn" id="btn-share" aria-label="Compartir">Compartir</button>
    </div>
    <p class="mono" style="opacity:.8;margin-top:.5rem;">
      Compatibilidad: ${p.badges?.filter(b => b.startsWith("Revit")).join(", ") || "Revit"}.
    </p>
  `;
    modal.showModal();
    history.replaceState(null, "", `#p=${slug}`);

    const share = $('#btn-share', modal);
    share?.addEventListener('click', async () => {
        const url = location.href;
        try {
            await navigator.clipboard.writeText(url);
            share.textContent = "¡Link copiado!"; setTimeout(() => share.textContent = "Compartir", 1200);
        } catch { prompt("Copia este enlace:", url); }
    });
}
modal?.addEventListener('close', () => {
    const ifr = $('iframe', modalBody);
    if (ifr) ifr.remove();
    if (parseHash()) history.replaceState(null, "", location.pathname + location.search);
});

/* ============================================================
   4) TARJETAS: HTML (con YouTube de fondo) + SCROLL INFINITO
============================================================ */
const PAGE_SIZE = 6;
const state = { filtered: [], page: 0, pagerObs: null, vidsObs: null, ytObs: null };

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
        ${(p.badges || []).map(b => `<span class="chip chip-muted">${b}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost" data-action="details" data-slug="${p.slug}">Detalles</button>
        <button class="btn btn-primary" data-action="get" data-slug="${p.slug}">Obtener</button>
      </div>
    </div>
  `;

    if (!hasYt && !hasPoster) return body;

    // Capa media: poster (fallback) + contenedor YT (se hidrata al entrar en viewport)
    const posterImg = hasPoster ? `<img class="poster" src="${p.poster}" alt="" aria-hidden="true" loading="lazy">` : "";
    const yt = hasYt ? `<div class="yt-bg" data-yt-id="${ytId}" data-start="${Number.isFinite(p.ytStart) ? p.ytStart : 0}" data-end="${Number.isFinite(p.ytEnd) ? p.ytEnd : ""}"></div>` : "";

    return `<div class="card-media" aria-hidden="true">${posterImg}${yt}</div>` + body;
}

function appendCard(p) {
    const card = document.createElement('article');
    const hasYt = !!(p.ytBgId || youtubeIdFromUrl(p.ytBgUrl));
    const cls = hasYt ? 'has-yt' : (p.poster ? 'has-media' : '');
    card.className = 'card ' + cls;
    card.setAttribute('role', 'listitem');
    card.innerHTML = buildCardHTML(p);
    grid.appendChild(card);
}

function observeYouTubeBGs() {
    state.ytObs?.disconnect?.();
    const nodes = $$('.yt-bg', grid);
    if (!nodes.length) return;

    state.ytObs = new IntersectionObserver((entries) => {
        entries.forEach(en => {
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
                    const ifr = document.createElement('iframe');
                    ifr.src = `${base}?${qs.toString()}`;
                    ifr.setAttribute('allow', 'autoplay; encrypted-media');
                    ifr.setAttribute('title', 'Preview');
                    ifr.setAttribute('tabindex', '-1');
                    ifr.setAttribute('loading', 'lazy');
                    host.appendChild(ifr);
                    host.dataset.hydrated = "1";
                }
            } else {
                // Para ahorrar recursos, eliminamos el iframe cuando sale de vista
                host.querySelector('iframe')?.remove();
                host.dataset.hydrated = "";
            }
        });
    }, { rootMargin: "200px" });

    nodes.forEach(n => state.ytObs.observe(n));
}

function observeCardVideos() {
    // Si alguna tarjeta usa <video> HTML5 local, seguimos soportándolo.
    state.vidsObs?.disconnect?.();
    const vids = $$('video[data-autoplay]', grid);
    if (!vids.length) return;
    state.vidsObs = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            const v = en.target;
            if (en.isIntersecting) v.play().catch(() => { });
            else { v.pause(); try { v.currentTime = Math.min(v.currentTime, 0.1); } catch { } }
        });
    }, { rootMargin: "120px" });
    vids.forEach(v => state.vidsObs.observe(v));
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
        $('#pager-sentinel')?.remove();
    }
}

function setupPager() {
    const sentinel = document.createElement('div');
    sentinel.id = 'pager-sentinel';
    sentinel.className = 'hidden';
    grid.appendChild(sentinel);

    state.pagerObs?.disconnect?.();
    state.pagerObs = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) renderNextPage();
    }, { rootMargin: '300px' });

    state.pagerObs.observe(sentinel);
}

function renderCards(filter = "") {
    if (!grid) return;
    grid.innerHTML = "";

    const q = (filter || "").trim().toLowerCase();
    state.filtered = PRODUCTS.filter(p =>
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
document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const slug = btn.getAttribute('data-slug');
    switch (action) {
        case 'details':
            openDetails(slug);
            break;
        case 'get': {
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
searchInput?.addEventListener('input', (e) => renderCards(e.target.value));

function openFromHash() {
    const slug = parseHash();
    if (slug) openDetails(slug);
}
window.addEventListener('hashchange', openFromHash);

/* ============================================================
   6) INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    renderCards("");
    openFromHash();
});
