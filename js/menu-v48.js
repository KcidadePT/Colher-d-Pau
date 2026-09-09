(()=>{
  "use strict";
  const WORKER_DATA_URL="https://colherdpau-admin-api.joao-c-veloso93.workers.dev/menu-data";
  const params=new URLSearchParams(location.search);
  const supported=["pt","en","fr","es","de","it","ru"];
  const lang=supported.includes(params.get("lang"))?params.get("lang"):"pt";
  let data=validData(window.MENU_DATA)?window.MENU_DATA:{food:[],beverages:[]};
  let type="food",cat="all",refreshPromise=null,lastRefresh=0,frame=0;
  const $=id=>document.getElementById(id);
  const euro=v=>new Intl.NumberFormat("pt-PT",{style:"currency",currency:"EUR"}).format(Number(v)||0);
  const labels={pt:{food:"Comida",drinks:"Bebidas",all:"Todos",title:"A nossa carta",sub:"Sabores portugueses, à sua mesa.",introText:"O melhor início para uma grande refeição."},en:{food:"Food",drinks:"Drinks",all:"All",title:"Our menu",sub:"Portuguese flavours, at your table.",introText:"The perfect beginning to a great meal."},fr:{food:"Plats",drinks:"Boissons",all:"Tous",title:"Notre carte",sub:"Saveurs portugaises, à votre table.",introText:"Le meilleur début pour un excellent repas."},es:{food:"Comida",drinks:"Bebidas",all:"Todos",title:"Nuestra carta",sub:"Sabores portugueses, en su mesa.",introText:"El mejor comienzo para una gran comida."},de:{food:"Speisen",drinks:"Getränke",all:"Alle",title:"Unsere Speisekarte",sub:"Portugiesische Aromen, an Ihrem Tisch.",introText:"Der beste Start in ein großartiges Essen."},it:{food:"Cibo",drinks:"Bevande",all:"Tutti",title:"Il nostro menu",sub:"Sapori portoghesi, alla vostra tavola.",introText:"Il miglior inizio per un ottimo pasto."},ru:{food:"Еда",drinks:"Напитки",all:"Все",title:"Наше меню",sub:"Португальские вкусы к вашему столу.",introText:"Лучшее начало отличной трапезы."}};
  const L=labels[lang]||labels.pt;
  const chefTitleParts={pt:{main:"SUGESTÃO",script:"do Chefe"},en:{main:"CHEF'S",script:"Suggestion"},fr:{main:"SUGGESTION",script:"du Chef"},es:{main:"SUGERENCIA",script:"del Chef"},de:{main:"EMPFEHLUNG",script:"des Küchenchefs"},it:{main:"SUGGERIMENTO",script:"dello Chef"},ru:{main:"РЕКОМЕНДАЦИЯ",script:"шеф-повара"}};
  const foodCats={couvert:"Couvert",starters:{pt:"Entradas",en:"Starters",fr:"Entrées",es:"Entradas",de:"Vorspeisen",it:"Antipasti",ru:"Закуски"}[lang]||"Entradas",vegetarian:{pt:"Vegetariano",en:"Vegetarian",fr:"Végétarien",es:"Vegetariano",de:"Vegetarisch",it:"Vegetariano",ru:"Вегетарианские блюда"}[lang]||"Vegetariano",fish:{pt:"Peixes",en:"Fish",fr:"Poissons",es:"Pescado",de:"Fisch",it:"Pesce",ru:"Рыбные блюда"}[lang]||"Peixes",meat:{pt:"Carnes",en:"Meat",fr:"Viandes",es:"Carne",de:"Fleisch",it:"Carne",ru:"Мясные блюда"}[lang]||"Carnes",desserts:{pt:"Sobremesas",en:"Desserts",fr:"Desserts",es:"Postres",de:"Nachtisch",it:"Dessert",ru:"Десерты"}[lang]||"Sobremesas"};
  const drinkCats={wine_green_white:"Vinhos Verdes Brancos",wine_white:"Vinhos Maduros Brancos",wine_green_red:"Vinhos Verdes Tintos",wine_red:"Vinhos Maduros Tintos",rose:"Vinhos Rosé",sparkling:"Espumantes",soft:"Águas e Refrigerantes",beer:"Cervejas",sangria:"Sangrias",digestif:"Aperitivos / Digestivos",hot:"Quentes"};
  const cats={...foodCats,...drinkCats};
  const escapeAttr=s=>String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const bar=$("floatingCategoryBar");
  const list=$("floatingCategoryButtons");
  if(!bar||!list||!$("menuContent"))return;
  const reducedMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smooth=()=>reducedMotion()?"instant":"smooth";
  const text=(value)=>escapeAttr(value);
  let lastData=JSON.stringify(data);

  function validData(value){return !!value&&Array.isArray(value.food)&&Array.isArray(value.beverages);}
  function currentItems(){return type==="food"?data.food:data.beverages;}
  function categories(){return [...new Set(currentItems().filter(x=>x.available!==false).map(x=>x.category))];}
  function imageSource(value,fallback){
    const s=String(value||"").trim();if(!s)return fallback;
    try{const u=new URL(s,document.baseURI);if(["https:","http:"].includes(u.protocol))return s;if(/^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(s))return s;}catch{}
    return fallback;
  }
  function itemKey(x,i,prefix){return prefix+":"+(x.id||x.code||((x.category||"")+":"+(typeof x.name==="string"?x.name:x.name?.pt||i)));}
  function compatible(a,b){return a&&a.nodeType===b.nodeType&&(a.nodeType!==1||(a.tagName===b.tagName&&(a.getAttribute("data-key")||"")===(b.getAttribute("data-key")||"")));}
  function patchNode(a,b){if(a.nodeType===3){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;return;}if(a.nodeType!==1)return;for(const attr of [...a.attributes])if(!b.hasAttribute(attr.name))a.removeAttribute(attr.name);for(const attr of [...b.attributes])if(a.getAttribute(attr.name)!==attr.value)a.setAttribute(attr.name,attr.value);patchChildren(a,b);}
  function patchChildren(parent,next){let at=parent.firstChild;for(const fresh of [...next.childNodes]){let node=at;const key=fresh.nodeType===1?fresh.getAttribute("data-key"):null;if(key&&(!compatible(node,fresh)))node=[...parent.children].find(el=>el.getAttribute("data-key")===key&&el.tagName===fresh.tagName)||null;if(!compatible(node,fresh)){node=fresh.cloneNode(true);parent.insertBefore(node,at);}else{if(node!==at)parent.insertBefore(node,at);patchNode(node,fresh);}at=node.nextSibling;}while(at){const next=at.nextSibling;parent.removeChild(at);at=next;}}
  function patchHTML(target,html){const t=document.createElement("template");t.innerHTML=html;patchChildren(target,t.content);}
  function applyHeader(){document.documentElement.lang=lang;$("pageTitle").textContent=L.title;$("pageSubtitle").textContent=L.sub;$("foodBtn").textContent=L.food;$("drinkBtn").textContent=L.drinks;document.querySelectorAll(".menu-language-flags a").forEach(a=>a.classList.toggle("active",a.dataset.lang===lang));}
  function renderChefSuggestion(){
    const block=data.chefSuggestion,section=$("chefSuggestion"),items=(block?.items||[]).filter(x=>x.available!==false);
    section.hidden=type!=="food"||!block||block.enabled===false||!items.length;if(section.hidden)return;
    const parts=chefTitleParts[lang]||chefTitleParts.pt;$("chefTitleMain").textContent=parts.main;$("chefTitleScript").textContent=parts.script;
    const names={Entrada:{pt:"ENTRADA",en:"STARTER",fr:"ENTRÉE",es:"ENTRADA",de:"VORSPEISE",it:"ANTIPASTO",ru:"ЗАКУСКА"},Peixe:{pt:"PEIXE",en:"FISH",fr:"POISSON",es:"PESCADO",de:"FISCH",it:"PESCE",ru:"РЫБА"},Carne:{pt:"CARNE",en:"MEAT",fr:"VIANDE",es:"CARNE",de:"FLEISCH",it:"CARNE",ru:"МЯСО"}};
    patchHTML($("chefGrid"),items.map((x,i)=>{const name=x.name?.[lang]||x.name?.pt||"",desc=x.description?.[lang]||x.description?.pt||"",image=imageSource(x.image,"assets/dish-placeholder.svg");return `<article class="chef-card" data-key="${text(itemKey(x,i,"chef"))}"><div class="chef-card-header"><span class="chef-type">${text(names[x.type]?.[lang]||x.type)}</span><h3>${text(name)}</h3></div><div class="chef-image-wrap"><img class="chef-image zoomable" src="${text(image)}" data-full="${text(image)}" data-caption="${text(name)}" alt="${text(name)}" data-fallback="assets/dish-placeholder.svg"><div class="chef-price">${euro(x.price)}</div></div><div class="chef-card-body"><p>${text(desc)}</p></div></article>`;}).join(""));
  }
  function renderCats(){
    const choices=[["all",L.all],...categories().map(k=>[k,cats[k]||k])];if(cat!=="all"&&!choices.some(([k])=>k===cat))cat="all";
    const buttons=(className)=>choices.map(([key,name])=>`<button type="button" class="${className}${cat===key?" active":""}" data-key="${text(key)}" data-c="${text(key)}" aria-pressed="${cat===key}">${text(name)}</button>`).join("");
    const x=list.scrollLeft;patchHTML(list,buttons("floating-cat-btn"));list.scrollLeft=x;patchHTML($("categoryStrip"),buttons("cat-btn"));updateArrows();
  }
  function renderMenu(){
    const grouped=new Map();
    currentItems().forEach((x,i)=>{if(x.available===false)return;if(!grouped.has(x.category))grouped.set(x.category,[]);grouped.get(x.category).push({x,i});});
    const markup=[...grouped].map(([key,items],index)=>{
      const rows=items.map(({x,i})=>{const isFood=type==="food",name=isFood?(x.name?.[lang]||x.name?.pt||""):(x.name||""),desc=isFood?(x.description?.[lang]||x.description?.pt||""):(x.region||""),fallback=isFood?"assets/dish-placeholder.svg":"assets/drink-placeholder.svg",image=imageSource(x.image,fallback);return `<article class="dish" data-key="${text(itemKey(x,i,type))}"><img class="dish-image${isFood?"":" drink-image"} zoomable" src="${text(image)}" data-full="${text(image)}" data-caption="${text(name)}" alt="${text(name)}" data-fallback="${fallback}"><div><h3>${text(name)}</h3>${desc?`<p>${text(desc)}</p>`:""}</div><div class="price"><span class="price-value">${euro(isFood?x.price:x.bottle)}</span>${!isFood&&x.glass?`<div class="tiny">Copo ${euro(x.glass)}</div>`:""}</div></article>`;}).join("");
      return `<section class="section${index===0?" first-menu-section":""}" data-key="section:${text(type+":"+key)}" data-category="${text(key)}"><div class="section-heading"><h2>${text(cats[key]||key)}</h2>${index===0&&type==="food"?`<span>${text(L.introText)}</span><i></i>`:""}</div>${rows}</section>`;
    }).join("");
    patchHTML($("menuContent"),markup);
  }
  function render(){document.body.dataset.menuView=type;document.body.dataset.menuCategory=cat;$("foodBtn").classList.toggle("active",type==="food");$("drinkBtn").classList.toggle("active",type==="beverages");renderChefSuggestion();renderCats();renderMenu();scheduleBar();}
  function updateArrows(){const max=Math.max(0,list.scrollWidth-list.clientWidth);$("floatingCategoryPrev").disabled=list.scrollLeft<=1;$("floatingCategoryNext").disabled=list.scrollLeft>=max-1;}
  function ensureActiveVisible(){const active=list.querySelector(".floating-cat-btn.active");if(active)active.scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"nearest",inline:"nearest"});}
  function setActiveCategory(value,keepVisible=true){if(cat===value)return;cat=value;document.body.dataset.menuCategory=cat;renderCats();if(keepVisible)ensureActiveVisible();}
  function updateActiveCategoryFromScroll(){
    if(!bar.classList.contains("is-visible")){if(cat!=="all")setActiveCategory("all",false);return;}
    const top=(parseFloat(getComputedStyle(bar).top)||12)+bar.offsetHeight+18;
    const sections=[...document.querySelectorAll("#menuContent .section[data-category]")];
    let active="all";
    for(const section of sections){if(section.getBoundingClientRect().top<=top)active=section.dataset.category;else break;}
    setActiveCategory(active,true);
  }
  function updateBar(){
    frame=0;const top=parseFloat(getComputedStyle(bar).top)||12,chef=$("chefSuggestion"),pastChef=chef.hidden||chef.getBoundingClientRect().bottom<=top+1,inMenu=$("menuArea").getBoundingClientRect().top<=top+bar.offsetHeight+8,visible=list.children.length>1&&pastChef&&inMenu&&!$("imageLightbox").classList.contains("open");
    bar.classList.toggle("is-visible",visible);bar.setAttribute("aria-hidden",String(!visible));bar.inert=!visible;document.body.classList.toggle("category-bar-visible",visible);updateActiveCategoryFromScroll();updateArrows();
  }
  function scheduleBar(){if(!frame)frame=requestAnimationFrame(updateBar);}
  function targetScrollY(target){const top=parseFloat(getComputedStyle(bar).top)||12;return Math.max(0,target.getBoundingClientRect().top+window.scrollY-top-bar.offsetHeight-10);}
  function chooseCategory(value){
    if(value!=="all"&&!categories().includes(value))return;
    const target=value==="all"?$("menuArea"):document.querySelector(`#menuContent .section[data-category="${CSS.escape(value)}"]`);if(!target)return;
    setActiveCategory(value,true);window.scrollTo({top:targetScrollY(target),behavior:smooth()});
  }
  $("categoryStrip").addEventListener("click",e=>{const b=e.target.closest("button[data-c]");if(b)chooseCategory(b.dataset.c);});
  list.addEventListener("click",e=>{const b=e.target.closest("button[data-c]");if(b)chooseCategory(b.dataset.c);});
  list.addEventListener("scroll",updateArrows,{passive:true});
  $("floatingCategoryPrev").onclick=()=>list.scrollBy({left:-Math.max(160,list.clientWidth*.7),behavior:smooth()});
  $("floatingCategoryNext").onclick=()=>list.scrollBy({left:Math.max(160,list.clientWidth*.7),behavior:smooth()});
  function switchType(next){if(type===next)return;type=next;cat="all";list.scrollLeft=0;render();requestAnimationFrame(updateBar);}
  $("foodBtn").onclick=()=>switchType("food");$("drinkBtn").onclick=()=>switchType("beverages");
  function closeLightbox(){$("imageLightbox").classList.remove("open");$("imageLightbox").setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");scheduleBar();}
  document.addEventListener("click",e=>{const img=e.target.closest("img.zoomable");if(!img)return;$("lightboxImage").src=img.dataset.full||img.src;$("lightboxImage").alt=img.alt;$("lightboxCaption").textContent=img.dataset.caption||img.alt||"";$("imageLightbox").classList.add("open");$("imageLightbox").setAttribute("aria-hidden","false");document.body.classList.add("modal-open");updateBar();});
  document.addEventListener("error",e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.dataset.fallback&&img.getAttribute("src")!==img.dataset.fallback){img.src=img.dataset.fallback;img.dataset.full=img.dataset.fallback;}},true);
  $("lightboxClose").onclick=closeLightbox;$("imageLightbox").onclick=e=>{if(e.target===$("imageLightbox"))closeLightbox();};document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLightbox();});
  function applyFreshData(next){
    const signature=JSON.stringify(next);if(signature===lastData)return;
    const scrollY=window.scrollY,anchor=[...document.querySelectorAll("#menuContent .dish,#chefGrid .chef-card")].find(el=>el.getBoundingClientRect().bottom>100),key=anchor?.dataset.key,screenY=anchor?.getBoundingClientRect().top;
    data=next;window.MENU_DATA=next;lastData=signature;render();
    if(!document.body.classList.contains("modal-open")){const updated=[...document.querySelectorAll("[data-key]")].find(el=>el.dataset.key===key),desired=updated&&screenY!==undefined?window.scrollY+updated.getBoundingClientRect().top-screenY:scrollY;if(Math.abs(window.scrollY-desired)>1)window.scrollTo({top:desired,behavior:"instant"});}
    updateBar();
  }
  async function refreshFromServer(force=false){
    if(refreshPromise)return refreshPromise;if(!force&&Date.now()-lastRefresh<1000)return;lastRefresh=Date.now();
    refreshPromise=(async()=>{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);try{const res=await fetch(WORKER_DATA_URL+"?_="+Date.now(),{cache:"no-store",signal:controller.signal});if(!res.ok)throw new Error("HTTP "+res.status);const body=await res.json();if(!body?.ok||!validData(body.data))throw new Error("Invalid menu data");applyFreshData(body.data);}catch(e){console.warn("Menu: latest data unavailable; keeping displayed content.",e.message);}finally{clearTimeout(timeout);refreshPromise=null;}})();return refreshPromise;
  }
  window.addEventListener("scroll",scheduleBar,{passive:true});window.addEventListener("resize",scheduleBar);window.addEventListener("focus",()=>refreshFromServer());window.addEventListener("pageshow",scheduleBar);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refreshFromServer();});window.addEventListener("storage",e=>{if(e.key==="colherdpau_menu_data")refreshFromServer();});document.addEventListener("load",scheduleBar,true);
  if(window.ResizeObserver){const ro=new ResizeObserver(scheduleBar);ro.observe($("menuArea"));ro.observe($("chefSuggestion"));}
  applyHeader();render();updateBar();refreshFromServer(true);
})();
