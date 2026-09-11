(()=>{
  "use strict";

  const FOOD_FALLBACK = "assets/dish-placeholder.svg";

  const icons = {
    fish:'<path d="M111 120c21-24 45-36 72-36 24 0 45 12 64 36-19 24-40 36-64 36-27 0-51-12-72-36Z"/><path d="M111 120 82 98v44l29-22Z"/><circle cx="203" cy="112" r="5" fill="#9a7440" stroke="none"/>',
    meat:'<path d="M116 91c20-19 55-16 74 3 17 17 18 45 1 62-20 20-56 22-78 1-20-19-17-48 3-66Z"/><circle cx="169" cy="118" r="15"/><path d="M186 155l21 21m-2-15 12 12m-23 0 12 12"/>',
    veggie:'<path d="M207 73c-58 3-93 35-90 83 45 5 79-25 90-83Z"/><path d="M120 165c21-30 43-49 78-72M150 129c-3-16 0-29 5-42m11 27c15 0 28 3 39 8"/>',
    dessert:'<path d="M111 161h98l-19-69h-60l-19 69Z"/><path d="M121 126h79M143 92c0-20 14-32 34-32 12 0 23 5 29 14"/><circle cx="195" cy="66" r="9" fill="#9a7440" stroke="none"/>',
    starters:'<path d="M98 151h124M111 151c5-39 27-61 49-61s44 22 49 61M160 90V72M147 72h26"/><path d="M119 169h82"/>',
    couvert:'<path d="M96 156h128M111 156c1-34 22-58 51-58 28 0 49 24 50 58"/><path d="M126 111c7-27 27-45 57-49 17 18 22 37 19 56M143 83l-11-22m35 13-2-28m24 36 12-20"/>',
    generic:'<circle cx="160" cy="119" r="61"/><path d="M120 135c13-17 26-25 40-25s27 8 40 25M132 91h56"/>'
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
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" rx="24" fill="#f5eee4"/><circle cx="160" cy="120" r="78" fill="#fffaf4" stroke="#d9c7ab" stroke-width="2"/><g fill="none" stroke="#9a7440" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${icon}</g></svg>`;
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

  function isActualFoodFallback(img){
    const src=(img.getAttribute("src")||"").split("?")[0].split("#")[0];
    return src.endsWith(FOOD_FALLBACK);
  }

  function upgrade(img){
    if(!(img instanceof HTMLImageElement) || !isActualFoodFallback(img)) return;
    const kind=byCategory[categoryFor(img)]||"generic";
    const uri=getPlaceholder(kind);
    img.src=uri;
    img.dataset.full=uri;
    img.dataset.smartPlaceholder=kind;
    img.classList.add("smart-dish-placeholder");
  }

  function scan(root=document){
    root.querySelectorAll?.("img").forEach(upgrade);
  }

  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      if(mutation.type==="attributes"){
        upgrade(mutation.target);
        continue;
      }
      mutation.addedNodes.forEach(node=>{
        if(node.nodeType!==1) return;
        if(node.matches?.("img")) upgrade(node);
        scan(node);
      });
    }
  });

  function start(){
    scan();
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["src"]});
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();