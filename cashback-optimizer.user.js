// ==UserScript==
// @name         Cashback-Optimizer Popup
// @namespace    http://tampermonkey.net/
// @version      5.10
// @description  Verlinkt die Seite und bindet bei teilnehmenden Shops ein Popup ein.
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
    const CB_PREFIX = "l-bank";
    const ICON_URL = `https://${MAIN_DOMAIN}/favicons/favicon.svg`;
    const CSP_SITES = ['rossmann.de', 'lidl.de', 'apple.com', 'tesla.com', 'google.'];

    function setStorage(k,v){ try{GM_setValue(k,v)}catch(e){localStorage.setItem('cb_'+k,v)} }
    function getStorage(k){ try{let r=GM_getValue(k); return r!==undefined?r:localStorage.getItem('cb_'+k)}catch(e){return localStorage.getItem('cb_'+k)} }
    function normalize(s) { return s ? s.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'') : ''; }

    // ==========================================
    // 1. MASTER DATENBANK (v5.10 - FULL RESTORE)
    // ==========================================
    const directLinks = {
        "Benefit Buddy": "https://www.benefitbuddy.de/",
        "BestChoice BenefitBuddy": "https://www.benefitbuddy.de/",
        "Hanseatic Vorteilswelt": "https://meine.hanseaticbank.de/?redirect=voucherPortal",
        "Vip District / MIVO": "https://mitarbeitervorteile.de/",
        "O2 Priority": "https://www.o2online.de/priority/vorteile/priority-vorteilswelt",
        "Cadooz (MyDealz)": "https://www.mydealz.de/deals/mydealz-cadooz-vorteilswelt-jetzt-fur-alle-zb-bestchoice-classic-50eur-5eur-i-adidas-12-cyberport-4-eterna-15-lieferando-5-etc-2353520",
        "Cadooz (Sparwelt)": "https://www.sparwelt.de/themenwelten/sparwelt-vorteilswelt",
        "Cadooz (AmEx)": "https://m.amex/amexofferslp2024",
        "Sovendus": `https://${MAIN_DOMAIN}/sovendus/`,
        "Allianz Vorteilswelt": "https://vorteile.allianz.de/einkaufsvorteile",
        "AmEx Offers": "https://m.amex/amexofferslp2024",
        "Corporate Benefits": CB_PREFIX ? `https://${CB_PREFIX}.mitarbeiterangebote.de/` : "https://mitarbeiterangebote.de/",
        "benefits.me": CB_PREFIX ? `https://${CB_PREFIX}.benefits.me/` : "https://benefits.me/",
        "benefitforme": CB_PREFIX ? `https://${CB_PREFIX}.benefits.me/` : "https://benefits.me/",
        "Miles & More": "https://www.miles-and-more.com/de/de/earn/shopping/shopping-platform.html?l=de",
        "Payback Prämienshop": "https://www.payback.de/praemien/kategorie/gutscheine",
        "Netto Kartenwelt": "https://www.netto-online.de/geschenk-gutscheinkarten/",
        "Marktkauf Kartenwelt": "https://www.marktkauf.de/geschenk-gutscheinkarten/kat-M0740",
        "MeinMagenta": "https://www.telekom.de/magenta-moments",
        "Samsung Members": "https://www.samsung.com/de/apps/samsung-members/"
    };

    const bcLinks = {
        "BestChoice Classic": "https://bestchoice-ace-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "BestChoice Premium": "https://premium-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "BestChoice Aktion": "https://bc-aktion-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "BestChoice Plus": "https://plus-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&locale=default&sortBy=alpha&ptg=vou",
        "BestChoice Style & Beauty": "https://style-beauty-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice DIY & Garden": "https://diy-garden-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Home & Living": "https://home-living-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Tech & Media": "https://tech-media-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "BestChoice Travel & Adventure": "https://travel-adventure-catalog.cadooz.com/frontend/cat/view.do?view=custom_view&lt=default&sortBy=alpha&ptg=vou",
        "Wunschgutschein": "https://www.wunschgutschein.de/pages/beliebtesten-einloesepartner",
        "Wunschgutschein Beauty": "https://app.wunschgutschein.de/beauty",
        "Wunschgutschein Home & Living": "https://app.wunschgutschein.de/homeandliving",
        "Wunschgutschein Fashion": "https://app.wunschgutschein.de/fashion",
        "Wunschgutschein Shopping": "https://app.wunschgutschein.de/shopping",
        "Wunschgutschein Sport": "https://app.wunschgutschein.de/sport",
        "Wunschgutschein Mobilität": "https://app.wunschgutschein.de/mobility",
        "Wunschgutschein Tanken": "https://app.wunschgutschein.de/mobility",
        "Wunschgutschein Kids & Fun": "https://app.wunschgutschein.de/kidsandfun",
        "Gutscheingold": "https://www.gutscheingold.de/grusskarten/#einloesepartner",
        "Gutscheingold Beauty": "https://www.gutscheingold.de/beauty/#einloesepartner",
        "Gutscheingold Kids": "https://www.gutscheingold.de/kids/#einloesepartner",
        "Gutscheingold Fashion": "https://www.gutscheingold.de/fashion/#einloesepartner",
        "Gutscheingold Home": "https://www.gutscheingold.de/home/#einloesepartner",
        "Gutscheingold Entertainment": "https://www.gutscheingold.de/entertainment/#einloesepartner",
        "Fashioncheque": "https://www.fashioncheque.com/de-de/shopfinder",
        "EveryWish": "https://www.every-wish.com/de/einloesepartner"
    };

    const luckyDomains = {
        "BSW": "bsw.de", "Shoop": "shoop.de", "Bestshopping": "bestshopping.com", "Shopback": "shopback.de", "Budgey": "budgey.de", "Zave.it": "zave.it", "Unidays": "myunidays.com", "DeutschlandCard": "deutschlandcard.de/partner", "Studentbeans": "studentbeans.com",
        "Wondercashback": "wondercashback.de", "Shopmate": "shopmate.eu", "mycashbacks": "mycashbacks.com"
    };

    // ==========================================
    // 2. MODUL: LINK ENRICHER (INTERNAL & EXTERNAL)
    // ==========================================
    function runLinker() {
        // A) MASTER-SCROLL (NUR DESKTOP MIT DELAY)
        if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            const filterTerm = new URLSearchParams(window.location.search).get('filter');
            if (filterTerm) {
                setTimeout(() => {
                    const target = Array.from(document.querySelectorAll('.shop-area-header.filter-tag, .voucher-area-header.filter-tag, .item-name'))
                                      .find(el => el.textContent.toLowerCase().includes(filterTerm.toLowerCase()));
                    if (target) {
                        const y = target.getBoundingClientRect().top + window.pageYOffset - 70;
                        window.scrollTo({top: y, behavior: 'auto'});
                    }
                }, 500);
            }
        }

        // B) ENRICHER LOGIK
        const enrich = () => {
            document.querySelectorAll('.shop-area-header.filter-tag, .voucher-area-header.filter-tag, .item-name').forEach(el => {
                if (el.querySelector('a.optimizer-link')) return;

                // 1. BUBBLE-SUPPORT (Internes onclick erben)
                const bubble = el.querySelector('.discountBanner');
                if (bubble) {
                    const bubbleAction = bubble.getAttribute('onclick');
                    if (bubbleAction) {
                        el.innerHTML = `<a href="javascript:void(0)" onclick="${bubbleAction}" class="optimizer-link" style="color:inherit !important; text-decoration:none !important; border-bottom:1px dotted gray !important;">${el.innerHTML}</a>`;
                        return;
                    }
                }

                // 2. SEKTIONS-ERKENNUNG (Gutscheine vs Cashback)
                let isVoucherSection = false;
                let prev = el.previousElementSibling;
                while (prev) {
                    if (prev.classList.contains('type-area')) {
                        if (prev.textContent.trim() === "Gutscheine") isVoucherSection = true;
                        break;
                    }
                    prev = prev.previousElementSibling;
                }

                // 3. EXTERNE LINK-LOGIK
                const text = el.textContent.trim();
                const isHeader = el.classList.contains('filter-tag');
                const shopArea = el.closest('.shop-area, .voucher-area');
                const rawName = shopArea?.querySelector('.filter-tag')?.textContent.replace(/<.*%/, '').trim() || "";
                const searchName = (rawName === "Netto MD") ? "Netto" : rawName;

                let url = (isHeader ? bcLinks[text] : null) || directLinks[text];

                if (!url) {
                    // Sektions-abhängig: Shopbuddies & TCB
                    if (text === "Shopbuddies") {
                        url = isVoucherSection ? `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(searchName)}+site:shopbuddies.de/giftcards-shop/products`
                                               : `https://www.shopbuddies.de/cashback/search?query=${encodeURIComponent(searchName)}`;
                    }
                    else if (text === "TopCashback") {
                        url = isVoucherSection ? "https://www.topcashback.de/EarnCashback.aspx?mpurl=topcashback-geschenkkarten"
                                               : `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(searchName)}+site:topcashback.de`;
                    }
                    // Spezial-Suchen
                    else if (text.includes("Dealwise")) url = `https://www.dealwise.de/results/${encodeURIComponent(searchName)}`;
                    else if (text === "Klarna") url = `https://www.klarna.com/de/store/?search=${encodeURIComponent(searchName)}`;
                    else if (text === "iGraal") url = `https://de.igraal.com/search/results?term=${encodeURIComponent(searchName)}`;
                    else if (text === "WEB.Cent") url = `https://shopping.web.de/webcent?q=${encodeURIComponent(searchName)}`;
                    else if (text === "Opera Cashback") url = `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(searchName)}+site:cashback.opera.com/de/shops`;

                    // Kartenwelten & Fallbacks
                    else if (text === "Penny Kartenwelt") url = `https://kartenwelt.penny.de/catalogsearch/result/?q=${encodeURIComponent(searchName)}`;
                    else if (text === "REWE Kartenwelt") url = `https://kartenwelt.rewe.de/catalogsearch/result/?q=${encodeURIComponent(searchName)}`;
                    else if (text === "Payback") url = `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(searchName)}+site:payback.de/shop`;
                    else if (luckyDomains[text]) url = `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(searchName)}+site:${luckyDomains[text]}`;
                }

                if (url) {
                    el.innerHTML = `<a href="${url}" target="_blank" rel="noreferrer" class="optimizer-link" referrerpolicy="no-referrer" style="color:inherit !important; text-decoration:none !important; border-bottom:1px dotted gray !important;">${el.innerHTML}</a>`;
                }
            });
        };
        setInterval(enrich, 800);
    }

    // ==========================================
    // 3. MODUL: POPUP (SMOOTH UI & CLICK OUTSIDE)
    // ==========================================
    async function getShopNames() {
        const CACHE_KEY = "names", TIME_KEY = "time", LIFE = 86400000;
        const cached = getStorage(CACHE_KEY), time = getStorage(TIME_KEY) || 0;
        if (cached && (Date.now() - time < LIFE)) return JSON.parse(cached);
        return new Promise(resolve => {
            const url = `https://${MAIN_DOMAIN}/`;
            const handler = r => {
                try {
                    const html = (typeof r === 'string') ? r : r.responseText;
                    const names = Array.from(new DOMParser().parseFromString(html, "text/html").querySelectorAll(".shop-area-header.filter-tag")).map(h => h.textContent.trim());
                    setStorage(CACHE_KEY, JSON.stringify(names)); setStorage(TIME_KEY, Date.now()); resolve(names);
                } catch(e) { resolve([]); }
            };
            if (typeof GM_xmlhttpRequest !== 'undefined') GM_xmlhttpRequest({ method: "GET", url: url, onload: handler, onerror: () => resolve([]) });
            else fetch(url).then(res => res.text()).then(handler).catch(() => resolve([]));
        });
    }

    function runPopup() {
        // EXCLUSIONS
        if (window.top !== window.self || [MAIN_DOMAIN, "google.", "bing.", "duckduckgo.", "mydealz.de", "pepper.pl", "preisvergleich.", "idealo.", "amazon.de"].some(d => location.href.includes(d))) return;

        getShopNames().then(names => {
            const host = location.hostname.toLowerCase();
            const pageTitle = normalize(document.title);
            let shop = null;

            if (host.includes('netto-online.de')) shop = "Netto MD";
            else if (host.includes('baur.de')) shop = "Baur";
            else if (host.includes('g-star.com')) shop = "G-Star RAW";
            else if (host.includes('otto.de')) shop = "Otto";

            if (!shop && names.length > 0) {
                const segs = host.split('.').filter(s => !['www','de','com','net','shop','online'].includes(s));
                for (const s of segs) { shop = names.find(n => normalize(n) === normalize(s)); if (shop) break; }
            }
            if (!shop && names.length > 0) shop = names.find(n => normalize(n).length > 3 && pageTitle.includes(normalize(n)));

            if (!shop) return;

            const id = "cb_" + Math.random().toString(36).substr(2, 5);
            const filterUrl = `https://${MAIN_DOMAIN}/?filter=${encodeURIComponent(shop)}`;
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const headerH = "50px";

            // SMOOTH TRANSITION STYLES
            const transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
            const desktopInitStyle = `width: 260px; height: ${headerH}; right: 20px; bottom: 20px; border-radius: 14px; will-change: width, height;`;
            const mobileInitStyle = `width: 56px; height: 56px; right: 20px; bottom: 85px; border-radius: 50%; will-change: width, height, transform;`;

            const html = `
                <div id="${id}" style="position:fixed !important; z-index:2147483647 !important; font-family:-apple-system,BlinkMacSystemFont,sans-serif !important; transition: ${transition}; ${isMobile ? mobileInitStyle : desktopInitStyle} overflow:hidden; background:#fffbe7; border:1px solid #e0c200; box-shadow:0 10px 30px rgba(0,0,0,0.2); display:flex; flex-direction:column; backface-visibility: hidden;">
                    <div id="${id}_h" style="display:flex; align-items:center; height:${headerH}; min-height:${headerH}; padding:0 14px; cursor:pointer; justify-content:center; flex-shrink:0;">
                        <div id="${id}_icowrap" style="width:26px; height:26px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <img id="${id}_i" src="${ICON_URL}" onerror="document.getElementById('${id}_fallback').style.display='block'; this.style.display='none'; document.getElementById('${id}').setAttribute('csp','1');" style="width:26px; height:26px;">
                            <span id="${id}_fallback" style="display:none; font-weight:900; color:#b1a100; font-size:16px;">CO</span>
                        </div>
                        <div id="${id}_t" style="flex:1; font-weight:700; color:#b1a100; font-size:15px !important; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-left:12px; ${isMobile ? 'display:none;' : ''}">${shop} Cashback</div>
                        <div id="${id}_x" style="font-size:28px; color:#b1a100; padding-left:10px; line-height:1; ${isMobile ? 'display:none;' : ''}">×</div>
                    </div>
                    <iframe id="${id}_f" src="${filterUrl}" style="opacity:0; pointer-events:none; transition: opacity 0.3s ease; width:100%; height:calc(100% - ${headerH}); border:none; background:transparent;"></iframe>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', html);
            const wrap = document.getElementById(id);
            const frame = document.getElementById(`${id}_f`);
            const label = document.getElementById(`${id}_t`);
            const closeX = document.getElementById(`${id}_x`);

            const minimize = () => {
                frame.style.opacity = "0";
                frame.style.pointerEvents = "none";
                setTimeout(() => {
                    if (isMobile) {
                        label.style.display = "none"; closeX.style.display = "none";
                        wrap.style.cssText = `position:fixed !important; z-index:2147483647 !important; ${mobileInitStyle} background:#fffbe7; border:1px solid #e0c200;`;
                    } else {
                        wrap.style.width = "260px"; wrap.style.height = headerH;
                    }
                }, 50);
            };

            // CLICK-OUTSIDE
            document.addEventListener('mousedown', (e) => {
                if (wrap && !wrap.contains(e.target) && frame.style.opacity === "1") minimize();
            });

            if (CSP_SITES.some(s => host.includes(s))) {
                wrap.setAttribute('csp', '1');
                document.getElementById(`${id}_i`).style.display = 'none';
                document.getElementById(`${id}_fallback`).style.display = 'block';
            }

            document.getElementById(`${id}_h`).onclick = (e) => {
                if (e.target.id === `${id}_x`) { wrap.remove(); return; }
                if (wrap.getAttribute('csp') === '1') { window.open(filterUrl, '_blank'); return; }

                if (frame.style.opacity === "0") {
                    if (isMobile) {
                        wrap.style.cssText += "width:100vw !important; height:calc(100vh - env(safe-area-inset-top, 20px)) !important; top:env(safe-area-inset-top, 20px) !important; bottom:0 !important; right:0 !important; border-radius:0 !important;";
                    } else {
                        wrap.style.width = "420px"; wrap.style.height = "450px";
                    }
                    setTimeout(() => {
                        frame.style.opacity = "1";
                        frame.style.pointerEvents = "auto";
                        label.style.display = "block";
                        closeX.style.display = "block";
                    }, 100);
                } else {
                    if (e.target.id === `${id}_t`) window.open(filterUrl, '_blank');
                    else minimize();
                }
            };
        });
    }

    if (location.href.includes(MAIN_DOMAIN)) runLinker(); else runPopup();
})();
