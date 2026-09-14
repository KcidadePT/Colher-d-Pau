(()=>{
  "use strict";

  const FOOD_FALLBACK = "assets/dish-placeholder.svg";

  const icons = {
    fish:'<g transform="translate(160 120) scale(.82) translate(-160 -120)"><path d="M111 120c21-24 45-36 72-36 24 0 45 12 64 36-19 24-40 36-64 36-27 0-51-12-72-36Z"/><path d="M111 120 82 98v44l29-22Z"/><circle cx="203" cy="112" r="5" fill="#9a7440" stroke="none"/></g>',
    meat:'<g transform="translate(160 120) scale(.86) translate(-160 -120)"><path d="M103 126c0-23 18-42 43-47 24-5 48 5 62 23 13 17 15 38 5 55-10 18-31 29-56 29-32 0-54-17-54-60Z"/><path d="M121 124c7-17 22-28 40-28 16 0 31 8 39 21 7 12 6 26-2 37-9 11-23 18-40 18-24 0-42-15-42-36 0-4 2-8 5-12Z"/><ellipse cx="185" cy="116" rx="15" ry="13"/><path d="M132 138l14-15M151 145l15-17M171 149l13-15"/></g>',
    veggie:'<g transform="translate(160 120) scale(.9) translate(-160 -120)"><path d="M214 70c-52 2-92 27-101 69-6 27 10 48 36 48 47 0 68-52 65-117Z"/><path d="M132 166c17-20 36-41 57-66"/><path d="M151 144c0-11 3-22 9-34"/><path d="M171 125c10 1 19 4 28 9"/></g>',
    dessert:'<g transform="translate(160 120) scale(.88) translate(-160 -120)"><ellipse cx="160" cy="171" rx="62" ry="15"/><path d="M116 145c2-30 17-48 44-48s42 18 44 48c1 18-13 29-44 29s-45-11-44-29Z"/><path d="M119 126c8-12 21-18 41-18 19 0 33 6 41 18"/><path d="M122 132c7 0 10 10 16 10s8-13 14-13 9 17 16 17 8-14 15-14 8 10 15 10"/><path d="M149 99c2-14 10-24 21-29 3 10 1 20-5 29"/><path d="M160 97c8-15 19-20 31-18-2 13-11 22-25 25"/><path d="M151 92c-8-9-9-19-4-29 10 5 16 13 17 24"/><path d="M147 96c7-11 15-16 24-16 9 0 16 5 22 15-8 6-15 9-23 9-8 0-16-3-23-8Z"/><circle cx="158" cy="91" r="2.5" fill="#9a7440" stroke="none"/><circle cx="169" cy="88" r="2.5" fill="#9a7440" stroke="none"/><circle cx="179" cy="94" r="2.5" fill="#9a7440" stroke="none"/></g>',
    starters:'<g transform="translate(160 120) scale(.84) translate(-160 -120)"><ellipse cx="160" cy="165" rx="68" ry="18"/><path d="M111 149h33v16h-33Z"/><path d="M116 149v-20c0-9 6-15 12-15s12 6 12 15v20"/><circle cx="128" cy="108" r="8"/><path d="M128 100V82"/><path d="M147 149h31v16h-31Z"/><path d="M152 149v-18c0-8 5-13 11-13s11 5 11 13v18"/><path d="M159 115c7-13 18-18 30-17-2 13-10 22-24 27"/><path d="M187 149h28v16h-28Z"/><rect x="190" y="123" width="22" height="22" rx="2"/><path d="M201 123V92"/></g>',
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