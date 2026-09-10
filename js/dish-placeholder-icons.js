(()=>{
  "use strict";

  const FOOD_FALLBACK = "assets/dish-placeholder.svg";

  const icons = {
    fish:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 32c9-13 23-18 36-4l8-8v24l-8-8C35 50 21 45 12 32Z"/><circle cx="36" cy="28" r="2.4" fill="currentColor" stroke="none"/><path d="M12 32 5 24v16l7-8Z"/></svg>',
    meat:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 18c8-8 20-7 27 0 6 6 7 17 1 23-8 8-22 9-30 1-7-7-5-18 2-24Z"/><circle cx="37" cy="27" r="6"/><path d="M42 42l9 9m-1-6 5 5m-10 0 5 5"/></svg>',
    veggie:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M52 10C29 11 15 24 16 43c18 2 32-10 36-33Z"/><path d="M17 47c9-12 18-20 31-29M29 33c-1-6 0-11 2-16m4 10c6 0 11 1 15 3"/></svg>',
    dessert:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 47h36L43 22H21l-7 25Z"/><path d="M18 34h28M25 22c0-7 5-11 12-11 4 0 8 2 10 5"/><circle cx="43" cy="14" r="4" fill="currentColor" stroke="none"/></svg>',
    starters:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 42h44M15 42c2-14 10-22 17-22s15 8 17 22M32 20v-6M27 14h10"/><path d="M18 49h28"/></svg>',
    couvert:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 44h44M16 44c0-10 7-18 16-18s16 8 16 18"/><path d="M21 31c2-9 8-15 17-16 5 5 7 10 6 16M26 22l-4-8m10 5-1-10m8 12 4-7"/></svg>',
    generic:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22"/><path d="M17 38c5-6 10-9 15-9s10 3 15 9M22 23h20"/></svg>'
  };

  const byCategory = {
    fish:"fish",
    meat:"meat",
    vegetarian:"veggie",
    desserts:"dessert",
    starters:"starters",
    couvert:"couvert"
  };

  function placeholderSvg(kind){
    const icon = icons[kind] || icons.generic;
    const label = ({fish:"Peixe",meat:"Carne",veggie:"Vegetariano",dessert:"Sobremesa",starters:"Entrada",couvert:"Couvert"})[kind] || "Prato";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" rx="28" fill="#f5eee4"/><circle cx="160" cy="104" r="58" fill="#fffaf4" stroke="#d9c7ab" stroke-width="2"/><g transform="translate(128 72)" fill="none" stroke="#9a7440" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${icon}</g><text x="160" y="190" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#6f6254">${label}</text></svg>`;
  }

  function asDataUri(svg){
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  const cache = new Map();
  function getPlaceholder(kind){
    if(!cache.has(kind)) cache.set(kind, asDataUri(placeholderSvg(kind)));
    return cache.get(kind);
  }

  function categoryFor(img){
    const section = img.closest(".section[data-category]");
    if(section) return section.dataset.category || "";
    const chef = img.closest(".chef-card");
    if(chef){
      const t=(chef.querySelector(".chef-type")?.textContent||"").toLowerCase();
      if(/peixe|fish|poisson|pescado|fisch|pesce|рыб/.test(t)) return "fish";
      if(/carne|meat|viande|fleisch|мяс/.test(t)) return "meat";
      if(/entrada|starter|entrée|vorspeise|antipasto|закуск/.test(t)) return "starters";
    }
    return "";
  }

  function isFoodFallback(img){
    const src=img.getAttribute("src")||"";
    const fallback=img.dataset.fallback||"";
    return src.endsWith(FOOD_FALLBACK) || fallback.endsWith(FOOD_FALLBACK);
  }

  function upgrade(img){
    if(!(img instanceof HTMLImageElement) || !isFoodFallback(img)) return;
    const category=categoryFor(img);
    const kind=byCategory[category]||"generic";
    const uri=getPlaceholder(kind);
    if(img.src===uri) return;
    img.src=uri;
    img.dataset.full=uri;
    img.dataset.smartPlaceholder=kind;
    img.classList.add("smart-dish-placeholder");
  }

  function scan(root=document){
    root.querySelectorAll?.('img[data-fallback="assets/dish-placeholder.svg"], img[src$="assets/dish-placeholder.svg"]').forEach(upgrade);
  }

  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      mutation.addedNodes.forEach(node=>{
        if(node.nodeType!==1) return;
        if(node.matches?.("img")) upgrade(node);
        scan(node);
      });
    }
  });

  function start(){
    scan();
    observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener("error",event=>{
      const img=event.target;
      if(img instanceof HTMLImageElement && (img.dataset.fallback||"").endsWith(FOOD_FALLBACK)){
        requestAnimationFrame(()=>upgrade(img));
      }
    },true);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
