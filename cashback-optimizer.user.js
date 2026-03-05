// ==UserScript==
// @name         Cashback-Optimizer Suite
// @namespace    http://tampermonkey.net/
// @version      4.03
// @description  Shop-Popup mit automatischer Verlinkung.
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

    // ==========================================
    // 1. GEMEINSAME KONFIGURATION & LINKS
    // ==========================================
    const OPTIMIZER_DOMAIN = "cashback-optimizer.de";
    const ICON_URL = "https://cashback-optimizer.de/favicons/favicon.svg";

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
        "Dealwise (ING)": "https://banking.ing.de/app/da_dealwise",
        "Dealwise": "https://banking.ing.de/app/da_dealwise",
        "benefitforme": "https://benefits.me/",
        "O2 Priority": "https://www.o2online.de/priority/vorteile/priority-vorteilswelt",
   "Klarna": "https://www.klarna.com/de/store/",
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
        "BestChoice Streaming & Entertainment": "https://streaming-entertainment-catalog.cadooz.com",
        "BestChoice Tech & Media": "https://tech-media-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Travel & Adventure": "https://travel-adventure-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Charity & Giving": "https://charity-giving-catalog.cadooz.com",
        "BestChoice Europe": "https://europe-catalog.cadooz.com",
        "BestChoice Europe Premium": "https://europe-premium-catalog.cadooz.com",
        "BestChoice Product": "https://product-catalog.cadooz.com",
        "BestChoice Classic CH": "https://bestchoice-classic-ch-catalog.cadooz.com",
        "BestChoice Classic AT": "https://bestchoice-classic-at-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "Gutscheingold Beauty": "https://www.gutscheingold.de/beauty/#einloesepartner",
        "Gutscheingold Beauty": "https://www.gutscheingold.de/beauty/#einloesepartner",
        "Gutscheingold": "https://www.gutscheingold.de/grusskarten/#einloesepartner",
          "Gutscheingold Kids": "https://www.gutscheingold.de/kids/#einloesepartner",
         "Gutscheingold Fashion": "https://www.gutscheingold.de/fashion/#einloesepartner",
             "Gutscheingold Home": "https://www.gutscheingold.de/home/#einloesepartner",
        "Gutscheingold Entertainment": "https://www.gutscheingold.de/entertainment/#einloesepartner",
                "Wunschgutschein": "https://www.wunschgutschein.de/pages/beliebtesten-einloesepartner",
       "Wunschgutschein Home & Living": "https://www.wunschgutschein.de/products/home-living-gutschein",
      "Wunschgutschein Mobilität": "https://www.wunschgutschein.de/products/tankgutschein", 
      "Wunschgutschein Kids & Fun": "https://www.wunschgutschein.de/products/kids-gutschein"
    
    };

    const googleLuckyDomains = {
        "Shoop": "shoop.de", "Shopbuddies": "shopbuddies.de", "Bestshopping": "bestshopping.com",
        "mycashbacks": "mycashbacks.com", "Wondercashback": "wondercashback.de", "Shopback": "shopback.de",
        "iGraal": "de.igraal.com", "Opera Cashback": "cashback.opera.com", "TopCashback": "topcashback.de",
        "Shopmate": "shopmate.eu", "WEB.Cent": "vorteilswelt.web.de", "DeutschlandCard": "deutschlandcard.de",
        "Budgey": "budgey.de", "Geschenkkartenwelt.de": "geschenkkartenwelt.de",
        "Unidays": "myunidays.com", "Studentbeans": "studentbeans.com", "BSW": "bsw.de", "Zave.it": "zave.it",
        "Hanseatic Vorteilswelt": "vorteilswelt.hanseaticbank.de",
    };

    // ==========================================
    // 2. MODUL: LINK-ENRICHER
    // ==========================================
    function runLinker() {
        const linkStyle = "color:inherit; text-decoration:none; border-bottom: 1px dotted gray;";

        function enrich() {
            document.querySelectorAll('.voucher-area-header.filter-tag, .shop-area-header.filter-tag').forEach(header => {
                if (header.querySelector('a.cb-opt-link')) return;

                for (let node of header.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const cleanText = node.textContent.trim();
                        if (cleanText.toLowerCase().includes("wunschgutschein")) continue;

                        let url = bcLinks[cleanText] || directLinks[cleanText];

                        if (url) {
                            const link = document.createElement('a');
                            link.href = url;
                            link.target = "_blank";
                            link.className = "cb-opt-link";
                            link.style = linkStyle;
                            link.textContent = node.textContent;
                            header.replaceChild(link, node);
                            break;
                        }
                    }
                }
            });

            document.querySelectorAll('.shop-area, .voucher-area').forEach(area => {
                const header = area.querySelector('.shop-area-header.filter-tag, .voucher-area-header.filter-tag');
                const shopName = header ? header.textContent.replace(/<.*%/, '').trim() : "";

                area.querySelectorAll('.item-name').forEach(item => {
                    if (item.querySelector('a')) return;
                    const text = item.textContent.trim();
                    if (text.toLowerCase().includes("wunschgutschein")) return;

                    let currentType = "";
                    let prev = item.previousElementSibling;
                    while (prev) {
                        if (prev.classList.contains('type-area')) { currentType = prev.textContent.trim().toLowerCase(); break; }
                        prev = prev.previousElementSibling;
                    }

                    let url = "";
                                       if (text === "Marktkauf Kartenwelt") url = `https://www.marktkauf.de/geschenk-gutscheinkarten/suche?q=${encodeURIComponent(shopName)}`;
                    else if (text === "Penny Kartenwelt") url = `https://kartenwelt.penny.de/catalogsearch/result/?q=${encodeURIComponent(shopName)}`;
                    else if (text === "REWE Kartenwelt") url = `https://kartenwelt.rewe.de/catalogsearch/result/?q=${encodeURIComponent(shopName)}`;
                    else if (text === "Payback") url = `https://www.payback.de/shop/${shopName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                    else if (text === "TopCashback" && currentType.includes("gutscheine")) url = "https://www.topcashback.de/EarnCashback.aspx?mpurl=topcashback-geschenkkarten";
                    else if (directLinks[text]) url = directLinks[text];
                    else if (googleLuckyDomains[text]) url = `https://www.google.com/search?q=site%3A${googleLuckyDomains[text]}+${encodeURIComponent(shopName)}&btnI=I`;

                    if (url) {
                        item.innerHTML = `<a href="${url}" target="_blank" style="${linkStyle}">${text}</a>`;
                    }
                });
            });
        }

        enrich();
        let timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(enrich, 200);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        document.addEventListener('keyup', (e) => { if (e.target.id === 'textFilter') enrich(); });
    }

    // ==========================================
    // 3. MODUL: POPUP-LOGIK
    // ==========================================
    function runPopup() {
        if (window.top !== window.self) return;
        const ignoreDomains = [OPTIMIZER_DOMAIN, 'google.', 'bing.', 'localhost', '127.0.0.1'];
        if (ignoreDomains.some(d => location.hostname.includes(d))) return;

        function normalize(s) { return s ? s.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'') : ''; }
        function getSegments(h) {
            const c = h.replace(/^www\d*\./, '').toLowerCase();
            const p = c.split('.');
            return p.length >= 3 ? [p.slice(0,-1).join('.'), p[0], p[1]] : [p[0]];
        }

        const CACHE_KEY = "cb_opt_cache", CACHE_TIME = "cb_opt_time", LIFE = 86400000;

        async function getData() {
            const cached = GM_getValue(CACHE_KEY);
            const time = GM_getValue(CACHE_TIME, 0);
            if (cached && (Date.now() - time < LIFE)) return cached;
            return new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: "GET", url: "https://cashback-optimizer.de/",
                    onload: r => { GM_setValue(CACHE_KEY, r.responseText); GM_setValue(CACHE_TIME, Date.now()); resolve(r.responseText); }
                });
            });
        }

        getData().then(html => {
            const doc = new DOMParser().parseFromString(html, "text/html");
            const headers = Array.from(doc.querySelectorAll(".shop-area-header.filter-tag"));
            const segments = getSegments(location.hostname);
            let foundShop = null;

            for (let seg of segments) {
                const normSeg = normalize(seg);
                foundShop = headers.find(h => normalize(h.textContent) === normSeg || (normSeg.length >= 4 && normalize(h.textContent).startsWith(normSeg)));
                if (foundShop) break;
            }

            if (!foundShop) return;
            const shopName = foundShop.textContent.trim();
            const filterUrl = `https://cashback-optimizer.de/?filter=${encodeURIComponent(shopName).replace(/%20/g, '+')}`;

            const host = document.createElement('div');
            document.body.appendChild(host);
            const shadow = host.attachShadow({mode: 'open'});
            const style = document.createElement('style');
            style.textContent = `
                #p{position:fixed;bottom:20px;right:20px;background:#fffbe7;border-radius:14px;box-shadow:0 4px 15px rgba(0,0,0,0.2);border:1px solid #e0c200;z-index:2147483647;font-family:sans-serif;width:260px;height:54px;display:flex;flex-direction:column;overflow:hidden;transition:width .4s cubic-bezier(.25,1,.5,1),height .4s cubic-bezier(.25,1,.5,1);will-change:width,height;animation:s .3s cubic-bezier(.25,1,.5,1) forwards}
                @keyframes s{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
                #p.ex{width:420px;height:360px;background:#fff}
                #h{display:flex;align-items:center;width:100%;padding:0 12px 0 16px;box-sizing:border-box;height:54px;flex-shrink:0}
                #p.ex #h{border-bottom:1px solid #e0c200;height:50px}
                #i{width:22px;height:22px;margin-right:12px;display:block}
                #l{flex:1;color:#b1a100;font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                #c{all:unset;cursor:pointer;font-size:1.5em;color:#b1a100;width:30px;text-align:center}
                #fr{width:100%;flex:1;border:none;opacity:0;visibility:hidden;transition:opacity .3s ease .2s}
                #p.ex #fr{opacity:1;visibility:visible}
            `;

            const p = document.createElement('div'); p.id = 'p';
            // Wieder zurück auf ICON_URL
            p.innerHTML = `<div id="h"><img id="i" src="${ICON_URL}"><a id="l">${shopName} Cashback</a><button id="c">&times;</button></div><iframe id="fr"></iframe>`;

            const l = p.querySelector('#l'), fr = p.querySelector('#fr'), c = p.querySelector('#c');
            l.onclick = () => { if(!p.classList.contains('ex')){ p.classList.add('ex'); if(!fr.src) fr.src = filterUrl; } else { window.open(filterUrl, '_blank'); }};
            c.onclick = () => host.remove();
            shadow.appendChild(style); shadow.appendChild(p);
        });
    }

    if (location.hostname.includes(OPTIMIZER_DOMAIN)) {
        runLinker();
    } else {
        runPopup();
    }
})();
