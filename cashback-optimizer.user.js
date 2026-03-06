// ==UserScript==
// @name         Cashback-Optimizer Suite
// @namespace    http://tampermonkey.net/
// @version      4.2
// @description  Verlinkungen und Popup für cashback-optimizer.de
// @author       ruler
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @allFrames    true
// ==/UserScript==

(function() {
    'use strict';

    const MAIN_DOMAIN = "cashback-optimizer.de";
    const GITLAB_PATH = "kolateeprojects.gitlab.io/cashback_optimizer";
    const ICON_URL = "https://cashback-optimizer.de/favicons/favicon.svg";

    // ==========================================
    // 1. GEMEINSAME KONFIGURATION
    // ==========================================
    const directLinks = {
        "Sovendus": "https://cashback-optimizer.de/sovendus/",
        "Allianz Vorteilswelt": "https://vorteile.allianz.de/einkaufsvorteile",
        "AmEx Offers": "https://m.amex/amexofferslp2024",
        "Cadooz (AmEx)": "https://m.amex/amexofferslp2024",
        "Vip District / MIVO": "https://mitarbeitervorteile.de/",
        "Miles & More": "https://www.miles-and-more.com/de/de/earn/shopping/shopping-platform.html?l=de",
        "Corporate Benefits": "https://mitarbeiterangebote.de/",
        "BestChoice BenefitBuddy": "https://www.benefitbuddy.de/",
        "Cadooz (MyDealz)": "https://www.mydealz.de/deals/mydealz-cadooz-vorteilswelt-jetzt-fur-alle-zb-bestchoice-classic-50eur-5eur-i-adidas-12-cyberport-4-eterna-15-lieferando-5-etc-2353520",
        "Cadooz (Sparwelt)": "https://www.sparwelt.de/themenwelten/sparwelt-vorteilswelt",
        "Benefit Buddy": "https://www.benefitbuddy.de/",
        "Payback Prämienshop": "https://www.payback.de/praemien/kategorie/gutscheine",
        "benefitforme": "https://benefits.me/",
        "O2 Priority": "https://www.o2online.de/priority/vorteile/priority-vorteilswelt",
        "Netto Kartenwelt": "https://www.netto-online.de/geschenk-gutscheinkarten/",
        "Marktkauf Kartenwelt": "https://www.marktkauf.de/geschenk-gutscheinkarten/kat-M0740",
        "Hanseatic Vorteilswelt": "https://meine.hanseaticbank.de/?redirect=voucherPortal",
        "MeinMagenta": "https://www.telekom.de/magenta-moments",
        "Samsung Members": "https://www.samsung.com/de/apps/samsung-members/"
    };

    const bcLinks = {
        "BestChoice Classic": "https://bestchoice-ace-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "BestChoice Premium": "https://premium-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "BestChoice Aktion": "https://bc-aktion-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "BestChoice Plus": "https://plus-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "BestChoice Birthday & Party": "https://birthday-party-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Style & Beauty": "https://style-beauty-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Fit & Healthy": "https://fit-healthy-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Drive & Ride": "https://drive-ride-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice DIY & Garden": "https://diy-garden-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Food & Drinks": "https://food-drinks-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Home & Living": "https://home-living-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Home & Office": "https://home-office-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Kids & Play": "https://kids-play-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Sport & Hobby": "https://sport-hobby-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Tech & Media": "https://tech-media-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Travel & Adventure": "https://travel-adventure-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        // Wunschgutschein App-Links
        "Wunschgutschein": "https://www.wunschgutschein.de/pages/beliebtesten-einloesepartner",
        "Wunschgutschein Beauty": "https://app.wunschgutschein.de/beauty#:~:text=GUTSCHEIN%20EINL%C3%96SEN-,Top%20Auswahl,-%E2%80%B9",
        "Wunschgutschein Home & Living": "https://app.wunschgutschein.de/homeandliving#:~:text=GUTSCHEIN%20EINL%C3%96SEN-,Top%20Auswahl,-%E2%80%B9",
        "Wunschgutschein Fashion": "https://app.wunschgutschein.de/fashion#:~:text=GUTSCHEIN%20EINL%C3%96SEN-,Top%20Auswahl,-%E2%80%B9",
        "Wunschgutschein Shopping": "https://app.wunschgutschein.de/shopping#:~:text=GUTSCHEIN%20EINL%C3%96SEN-,Top%20Auswahl,-%E2%80%B9",
        "Wunschgutschein Sport": "https://app.wunschgutschein.de/sport#:~:text=GUTSCHEIN%20EINL%C3%96SEN-,Top%20Auswahl,-%E2%80%B9",
        "Wunschgutschein Mobilität": "https://app.wunschgutschein.de/mobilitaet#:~:text=GUTSCHEIN%20EINL%C3%96SEN-,Top%20Auswahl,-%E2%80%B9",
        "Wunschgutschein Tanken": "https://app.wunschgutschein.de/mobility#:~:text=GUTSCHEIN%20EINL%C3%96SEN-,Top%20Auswahl,-%E2%80%B9",
        "Wunschgutschein Kids & Fun": "https://app.wunschgutschein.de/kids#:~:text=GUTSCHEIN%20EINL%C3%96SEN-,Top%20Auswahl,-%E2%80%B9",
        // Gutscheingold
        "Gutscheingold": "https://www.gutscheingold.de/grusskarten/#einloesepartner",
        "Gutscheingold Beauty": "https://www.gutscheingold.de/beauty/#einloesepartner",
        "Gutscheingold Kids": "https://www.gutscheingold.de/kids/#einloesepartner",
        "Gutscheingold Fashion": "https://www.gutscheingold.de/fashion/#einloesepartner",
        "Gutscheingold Home": "https://www.gutscheingold.de/home/#einloesepartner",
        "Gutscheingold Entertainment": "https://www.gutscheingold.de/entertainment/#einloesepartner"
    };

    const googleLuckyDomains = {
        "Shoop": "shoop.de", "TopCashback": "topcashback.de",
        "mycashbacks": "mycashbacks.com", "Wondercashback": "wondercashback.de", "Shopback": "shopback.de",
        "Shopmate": "shopmate.eu", "DeutschlandCard": "deutschlandcard.de/partner", "Budgey": "budgey.de",
        "Geschenkkartenwelt.de": "geschenkkartenwelt.de", "Unidays": "myunidays.com",
        "Studentbeans": "studentbeans.com", "BSW": "bsw.de", "Zave.it": "zave.it"
    };

    // ==========================================
    // 2. MODUL: LINK-ENRICHER (Auf Optimizer/GitLab)
    // ==========================================
    function runLinker() {
        if (window.top !== window.self) {
            const style = document.createElement('style');
            style.textContent = `
                .general-center, #top-logo, #tagBar, #impressumToggle { display: none !important; }
                .content-wrapper { padding-top: 5px !important; }
                .filter { margin-top: 0 !important; margin-bottom: 5px !important; }
            `;
            document.head.appendChild(style);

            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('filter')) {
                const scrollObserver = new MutationObserver((mutations, obs) => {
                    const firstShop = document.querySelector('.shop-area-header.filter-tag, .voucher-area-header.filter-tag');
                    if (firstShop && firstShop.offsetParent !== null) {
                        firstShop.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        obs.disconnect();
                    }
                });
                scrollObserver.observe(document.body, { childList: true, subtree: true });
            }
        }

        const linkStyle = "color:inherit; text-decoration:none; border-bottom: 1px dotted gray;";

        function enrich() {
            document.querySelectorAll('.voucher-area-header.filter-tag, .shop-area-header.filter-tag').forEach(header => {
                if (header.querySelector('a.cb-opt-link')) return;
                const text = header.textContent.trim();
                let url = bcLinks[text] || directLinks[text];
                if (url) header.innerHTML = `<a href="${url}" target="_blank" class="cb-opt-link" style="${linkStyle}">${text}</a>`;
            });

            document.querySelectorAll('.shop-area, .voucher-area').forEach(area => {
                const header = area.querySelector('.shop-area-header.filter-tag, .voucher-area-header.filter-tag');
                const shopName = header ? header.textContent.replace(/<.*%/, '').trim() : "";
                const cleanPart = shopName.toLowerCase().replace(/[^a-z0-9]/g, '');

                area.querySelectorAll('.item-name').forEach(item => {
                    if (item.querySelector('a')) return;
                    const text = item.textContent.trim();
                    if (text.toLowerCase().includes("wunschgutschein") || text.toLowerCase().includes("gutscheingold")) return;

                    let url = "";
                    if (text === "Penny Kartenwelt") url = `https://kartenwelt.penny.de/catalogsearch/result/?q=${encodeURIComponent(shopName)}`;
                    else if (text === "REWE Kartenwelt") url = `https://kartenwelt.rewe.de/catalogsearch/result/?q=${encodeURIComponent(shopName)}`;
                    else if (text === "Payback") url = `https://www.payback.de/shop/${cleanPart}`;
                    else if (text === "iGraal") url = `https://de.igraal.com/search/results?term=${encodeURIComponent(shopName)}`;
                    else if (text === "Opera Cashback") url = `https://www.google.com/search?q=site%3Acashback.opera.com%2Fde%2Fshops+${encodeURIComponent(shopName)}&btnI=I`;
                    else if (text === "WEB.Cent") url = `https://shopping.web.de/webcent?q=${encodeURIComponent(shopName)}&comp=web_start_sf#.cbk.nav.suche`;
                    else if (text === "Dealwise" || text === "Dealwise (ING)") url = `https://www.dealwise.de/results/${encodeURIComponent(shopName)}`;
                    else if (text === "Shopbuddies") url = `https://shopbuddies.de/cashback/search?query=${encodeURIComponent(shopName)}`;
                    else if (text === "Klarna") url = `https://www.klarna.com/de/store/?search=${encodeURIComponent(shopName).replace(/%20/g, '+')}`;
                    else if (text === "TopCashback" && (item.previousElementSibling && item.previousElementSibling.textContent.trim().toLowerCase().includes("gutscheine"))) url = "https://www.topcashback.de/EarnCashback.aspx?mpurl=topcashback-geschenkkarten";
                    else if (directLinks[text]) url = directLinks[text];
                    else if (googleLuckyDomains[text]) url = `https://www.google.com/search?q=site%3A${googleLuckyDomains[text]}+${encodeURIComponent(shopName)}&btnI=I`;

                    if (url) item.innerHTML = `<a href="${url}" target="_blank" style="${linkStyle}">${text}</a>`;
                });
            });
        }
        enrich();
        new MutationObserver(enrich).observe(document.body, { childList: true, subtree: true });
    }

    // ==========================================
    // 3. MODUL: POPUP-LOGIK (Fremde Seiten)
    // ==========================================
    function runPopup() {
        if (window.top !== window.self) return;
        const ignoreDomains = [MAIN_DOMAIN, 'gitlab.io', 'google.', 'bing.', 'localhost', '127.0.0.1', 'ycombinator.com'];
        if (ignoreDomains.some(d => location.href.includes(d))) return;

        function normalize(s) { return s ? s.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'') : ''; }

        async function getData() {
            const CACHE_KEY = "cb_opt_cache", LIFE = 86400000;
            const cached = GM_getValue(CACHE_KEY), time = GM_getValue("cb_opt_time", 0);
            if (cached && (Date.now() - time < LIFE)) return cached;
            return new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: "GET", url: "https://cashback-optimizer.de/",
                    onload: r => { GM_setValue(CACHE_KEY, r.responseText); GM_setValue("cb_opt_time", Date.now()); resolve(r.responseText); }
                });
            });
        }

        getData().then(html => {
            const doc = new DOMParser().parseFromString(html, "text/html");
            const headers = Array.from(doc.querySelectorAll(".shop-area-header.filter-tag"));
            const segments = location.hostname.toLowerCase().split('.');
            const filtered = segments.filter(s => !['www', 'news', 'de', 'com'].includes(s));

            let foundShop = null;
            if (filtered.length > 0) {
                const target = normalize(filtered[0]);
                foundShop = headers.find(h => {
                    const hNorm = normalize(h.textContent);
                    return hNorm === target || (target.length >= 5 && hNorm.startsWith(target));
                });
            }

            if (!foundShop) return;
            const shopName = foundShop.textContent.trim();
            const filterUrl = `https://cashback-optimizer.de/?filter=${encodeURIComponent(shopName).replace(/%20/g, '+')}`;

            const hostDiv = document.createElement('div');
            document.body.appendChild(hostDiv);
            const shadow = hostDiv.attachShadow({mode: 'open'});
            const style = document.createElement('style');
            style.textContent = `
                #p{position:fixed;bottom:20px;right:20px;background:#fffbe7;border-radius:14px;box-shadow:0 4px 15px rgba(0,0,0,0.2);border:1px solid #e0c200;z-index:2147483647;font-family:sans-serif;width:260px;height:54px;display:flex;flex-direction:column;overflow:hidden;transition:all .4s cubic-bezier(.25,1,.5,1);}
                #p.ex{width:420px;height:380px;}
                #h{display:flex;align-items:center;width:100%;padding:0 12px 0 16px;box-sizing:border-box;height:54px;flex-shrink:0;cursor:pointer;}
                #p.ex #h{border-bottom:1px solid #e0c200;height:50px}
                #i{width:22px;height:22px;margin-right:12px;}
                #l{flex:1;color:#b1a100;font-weight:600;font-size:16px;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                #c{all:unset;cursor:pointer;font-size:1.5em;color:#b1a100;width:30px;text-align:center}
                #fr{width:100%;flex:1;border:none;display:none;background:transparent;}
                #p.ex #fr{display:block;}
            `;

            const p = document.createElement('div'); p.id = 'p';
            p.innerHTML = `<div id="h"><img id="i" src="${ICON_URL}"><span id="l">${shopName} Cashback</span><button id="c">&times;</button></div><iframe id="fr"></iframe>`;

            const headerBar = p.querySelector('#h');
            const iframe = p.querySelector('#fr');

            headerBar.onclick = (e) => {
                if(e.target.id === 'c') return;

                if(!p.classList.contains('ex')){
                    p.classList.add('ex');
                    if(!iframe.src) iframe.src = filterUrl;
                } else {
                    if(e.target.id === 'l') {
                        window.open(filterUrl, '_blank');
                    } else {
                        p.classList.remove('ex');
                    }
                }
            };

            p.querySelector('#c').onclick = (e) => { e.stopPropagation(); hostDiv.remove(); };

            document.addEventListener('mousedown', (e) => {
                if (!hostDiv.contains(e.target) && p.classList.contains('ex')) { p.classList.remove('ex'); }
            });

            shadow.appendChild(style); shadow.appendChild(p);
        });
    }

    if (location.href.includes(MAIN_DOMAIN) || location.href.includes("kolateeprojects.gitlab.io/cashback_optimizer")) {
        runLinker();
    } else {
        runPopup();
    }
})();
