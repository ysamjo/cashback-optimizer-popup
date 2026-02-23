// ==UserScript==
// @name         Cashback-Optimizer Popup
// @namespace    http://tampermonkey.net/
// @version      4.5
// @description  Kompaktes Cashback-Popup.
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // --- KONFIGURATION ---
    const OPTIMIZER_URL = "https://kolateeprojects.gitlab.io/cashback_optimizer/";
    const ICON_URL = "https://cashback-optimizer.de/favicons/favicon.svg";
    const CACHE_KEY = "cashback_opt_cache";
    const CACHE_TIME_KEY = "cashback_opt_cache_time";
    const ICON_CACHE_KEY = "cashback_opt_icon_cache"; // Neuer Key für das Icon
    const CACHE_LIFE = 24 * 60 * 60 * 1000;

    const ignoreDomains = [
        'cashback-optimizer.de','google.','bing.','localhost','127.0.0.1',
        'netflix.','wow.','dazn.','disney.','primevideo.','prime.','tv.apple.com',
        'joyn.','paramountplus.','sky.','magenta-tv.','tvnow.','hbomax.','hulu.','peacocktv.','pluto.tv','rakuten.tv','plex.tv'
    ];

    const HOSTNAME_MAPPING = {
        'stories': '& Other Stories', 'otherstories': '& Other Stories',
        'g-star': 'G-Star RAW', 'hm': 'H&M', 'hm-home': 'H&M Home',
        'c-and-a': 'C&A', 'tommy': 'Tommy Hilfiger', 'pullandbear': 'Pull & Bear',
        'kapten-and-son': 'Kapten & Son', 'hotelbb': 'B&B Hotels',
        'flixbus': 'FlixBus & FlixTrain', 'tarife.mediamarkt': 'MediaMarkt Tarifwelt',
        'tarife.saturn': 'Saturn Tarifwelt'
    };

    function normalizeForMatch(str) {
        if (!str) return '';
        return str.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
    }

    function getHostSegments(hostname) {
        const cleaned = hostname.replace(/^www\d*\./, '').toLowerCase();
        const parts = cleaned.split('.');
        const segments = [];
        if (parts.length >= 3) segments.push(parts.slice(0, -1).join('.'));
        segments.push(parts[0]);
        if (parts.length >= 3) segments.push(parts[1]);
        return Array.from(new Set(segments));
    }

    function findMatchingShop(shopHeaders) {
        const segments = getHostSegments(window.location.hostname);
        for (const segment of segments) {
            const segNorm = normalizeForMatch(segment);
            const segLower = segment.toLowerCase();
            if (HOSTNAME_MAPPING[segLower]) {
                const mappedName = HOSTNAME_MAPPING[segLower];
                for (const header of shopHeaders) {
                    if (header.textContent.trim() === mappedName) return { shopName: mappedName };
                }
            }
            for (const header of shopHeaders) {
                const shopTxt = (header.textContent || "").trim();
                const shopNorm = normalizeForMatch(shopTxt);
                if (segNorm === shopNorm) return { shopName: shopTxt };
                if (segNorm.length >= 4 && shopNorm.startsWith(segNorm)) return { shopName: shopTxt };
            }
        }
        return null;
    }

    // Lädt das HTML der Seite
    function getCachedContent(url) {
        const content = GM_getValue(CACHE_KEY, null);
        const lastFetch = GM_getValue(CACHE_TIME_KEY, 0);
        if(content && (Date.now() - lastFetch < CACHE_LIFE)) return Promise.resolve(content);

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET", url: url,
                onload: response => {
                    GM_setValue(CACHE_KEY, response.responseText);
                    GM_setValue(CACHE_TIME_KEY, Date.now());
                    resolve(response.responseText);
                },
                onerror: () => reject("Fehler beim Laden!")
            });
        });
    }

    // Lädt das Icon und speichert es dauerhaft als String
    function getCachedIcon() {
        return new Promise((resolve) => {
            const cachedIcon = GM_getValue(ICON_CACHE_KEY, null);
            if (cachedIcon) return resolve(cachedIcon); // Sofort aus dem Speicher holen

            GM_xmlhttpRequest({
                method: "GET",
                url: ICON_URL,
                onload: function(response) {
                    // SVG-Text in eine sichere URL umwandeln
                    const svgDataUri = "data:image/svg+xml;utf8," + encodeURIComponent(response.responseText);
                    GM_setValue(ICON_CACHE_KEY, svgDataUri); // Im Tampermonkey Cache speichern
                    resolve(svgDataUri);
                },
                onerror: () => resolve(ICON_URL) // Fallback zur normalen URL, falls Fehler
            });
        });
    }

    // --- UI LOGIK ---

    const host = window.location.hostname;
    if (ignoreDomains.some(d => host.includes(d))) return;

    // Beide Daten (HTML und Icon) gleichzeitig abrufen
    Promise.all([getCachedContent(OPTIMIZER_URL), getCachedIcon()]).then(([html, iconDataUri]) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const headers = doc.querySelectorAll(".shop-area-header.filter-tag");
        const found = findMatchingShop(headers);

        if (!found) return;

        const shopName = found.shopName;
        const filterUrl = `https://www.cashback-optimizer.de/?filter=${encodeURIComponent(shopName).replace(/%20/g, '+')}`;

        if (document.getElementById('cashback-optimizer-shadow-host')) return;

        const shadowHost = document.createElement('div');
        shadowHost.id = 'cashback-optimizer-shadow-host';
        document.body.appendChild(shadowHost);
        const shadow = shadowHost.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            :host { all: initial; }
            #cb-popup {
                position: fixed; bottom: 20px; right: 20px;
                background: #fffbe7; border-radius: 14px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                border: 1px solid #e0c200; z-index: 2147483647;
                font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px;
                height: 54px; display: flex; align-items: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;
                animation: cb-fadein 0.25s ease-out; overflow: hidden;
            }
            #cb-popup.expanded { width: 420px; height: 360px; background: #fff; flex-direction: column; align-items: stretch; }
            @keyframes cb-fadein { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            #cb-header { display: flex; align-items: center; width: 100%; padding: 0 12px 0 16px; box-sizing: border-box; height: 54px; flex-shrink: 0; }
            #cb-popup.expanded #cb-header { border-bottom: 1px solid #e0c200; height: 50px; }

            #cb-favicon { width: 22px; height: 22px; margin-right: 12px; flex-shrink: 0; }

            #cb-mainlink { flex: 1; color: #b1a100; font-weight: 600; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
            #cb-mainlink:hover { text-decoration: underline; }

            #cb-close, #cb-close-compact { all: unset; cursor: pointer; color: #b1a100; font-size: 1.4em; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s; }
            #cb-close:hover, #cb-close-compact:hover { background: #ffe066; color: #fff; }

            #cb-close { display: none; }
            #cb-popup.expanded #cb-close { display: flex; }
            #cb-popup.expanded #cb-close-compact { display: none; }

            #cb-iframe { display: none; width: 100%; flex: 1; border: none; background: #fff; }
            #cb-popup.expanded #cb-iframe { display: block; }
        `;

        const div = document.createElement('div');
        div.id = 'cb-popup';
        div.innerHTML = `
            <div id="cb-header">
                <img id="cb-favicon" src="${iconDataUri}" alt="CO">
                <a id="cb-mainlink" title="Cashback Details anzeigen">${shopName} Cashback?</a>
                <button id="cb-close" title="Minimieren">&minus;</button>
                <button id="cb-close-compact" title="Schließen">&times;</button>
            </div>
            <iframe id="cb-iframe" src="" allowfullscreen></iframe>
        `;

        const mainlink = div.querySelector('#cb-mainlink');
        const iframe = div.querySelector('#cb-iframe');

        mainlink.onclick = (e) => {
            if (!div.classList.contains('expanded')) {
                e.preventDefault();
                div.classList.add('expanded');
                iframe.src = filterUrl;
            } else {
                window.open(filterUrl, '_blank', 'noopener,noreferrer');
            }
        };

        div.querySelector('#cb-close').onclick = () => {
            div.classList.remove('expanded');
            iframe.src = '';
        };

        div.querySelector('#cb-close-compact').onclick = () => shadowHost.remove();

        shadow.appendChild(style);
        shadow.appendChild(div);
    });
})();
