(()=>{
  "use strict";

  const FOOD_FALLBACK = "assets/dish-placeholder.svg";

  const icons = {
    fish:'<g transform="translate(160 120) scale(.82) translate(-160 -120)"><path d="M111 120c21-24 45-36 72-36 24 0 45 12 64 36-19 24-40 36-64 36-27 0-51-12-72-36Z"/><path d="M111 120 82 98v44l29-22Z"/><circle cx="203" cy="112" r="5" fill="#9a7440" stroke="none"/></g>',
    meat:'<g transform="translate(160 120) scale(.9) translate(-160 -120)"><path d="M118 91c18-18 50-19 72-7 18 10 30 27 29 45-1 20-17 38-40 47-25 10-55 5-72-12-18-18-17-48 11-73Z"/><path d="M139 105c10-8 25-9 36-3 10 5 16 14 15 24-1 11-10 21-22 25-13 5-29 2-38-7-10-10-7-27 9-39Z"/><path d="M195 151l18 18"/><path d="M205 151l18 18"/><path d="M192 162l12 12"/></g>',
    veggie:'<g transform="translate(160 120) scale(.9) translate(-160 -120)"><path d="M214 70c-52 2-92 27-101 69-6 27 10 48 36 48 47 0 68-52 65-117Z"/><path d="M132 166c17-20 36-41 57-66"/><path d="M151 144c0-11 3-22 9-34"/><path d="M171 125c10 1 19 4 28 9"/></g>',
    dessert:'<g transform="translate(160 120) scale(.9) translate(-160 -120)"><path d="M113 163h94l-13-62c-2-10-11-17-21-17h-26c-10 0-19 7-21 17l-13 62Z"/><path d="M122 132h76"/><path d="M136 102c4-22 18-35 38-35 12 0 24 5 31 14"/><circle cx="198" cy="72" r="8" fill="#9a7440" stroke="none"/></g>',
    starters:'<g transform="translate(160 120) scale(.9) translate(-160 -120)"><path d="M101 155h118"/><path d="M115 155c3-35 21-57 45-57s42 22 45 57"/><path d="M160 98V79"/><path d="M148 79h24"/><path d="M122 170h76"/></g>',
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