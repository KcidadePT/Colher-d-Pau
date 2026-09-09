(()=>{
  const base = window.MENU_DATA;
  const saved = localStorage.getItem("colherdpau_menu_data");
  const data = saved ? JSON.parse(saved) : base;

  const params = new URLSearchParams(location.search);
  const lang = params.get("lang") || "pt";
  let type = "food";
  let cat = "all";

  const $ = id => document.getElementById(id);
  const euro = v => new Intl.NumberFormat("pt-PT",{style:"currency",currency:"EUR"}).format(v);

  const labels = {
    pt:{food:"Comida",drinks:"Bebidas",all:"Todos",title:"A nossa carta",sub:"Sabores portugueses, à sua mesa.",chef:"Sugestão do Chefe",intro:"Entradas",introText:"O melhor início para uma grande refeição."},
    en:{food:"Food",drinks:"Drinks",all:"All",title:"Our menu",sub:"Portuguese flavours, at your table.",chef:"Chef's Suggestion",intro:"Starters",introText:"The perfect beginning to a great meal."},
    fr:{food:"Plats",drinks:"Boissons",all:"Tous",title:"Notre carte",sub:"Saveurs portugaises, à votre table.",chef:"Suggestion du Chef",intro:"Entrées",introText:"Le meilleur début pour un excellent repas."},
    es:{food:"Comida",drinks:"Bebidas",all:"Todos",title:"Nuestra carta",sub:"Sabores portugueses, en su mesa.",chef:"Sugerencia del Chef",intro:"Entradas",introText:"El mejor comienzo para una gran comida."},
    de:{food:"Speisen",drinks:"Getränke",all:"Alle",title:"Unsere Speisekarte",sub:"Portugiesische Aromen, an Ihrem Tisch.",chef:"Empfehlung des Küchenchefs",intro:"Vorspeisen",introText:"Der beste Start in ein großartiges Essen."},
    it:{food:"Cibo",drinks:"Bevande",all:"Tutti",title:"Il nostro menu",sub:"Sapori portoghesi, alla vostra tavola.",chef:"Suggerimento dello Chef",intro:"Antipasti",introText:"Il miglior inizio per un ottimo pasto."},
    ru:{food:"Еда",drinks:"Напитки",all:"Все",title:"Наше меню",sub:"Португальские вкусы к вашему столу.",chef:"Рекомендация шеф-повара",intro:"Закуски",introText:"Лучшее начало отличной трапезы."}
  };
  const L = labels[lang] || labels.pt;
  const chefTitleParts = {
    pt:{main:"SUGESTÃO",script:"do Chefe"},
    en:{main:"CHEF'S",script:"Suggestion"},
    fr:{main:"SUGGESTION",script:"du Chef"},
    es:{main:"SUGERENCIA",script:"del Chef"},
    de:{main:"EMPFEHLUNG",script:"des Küchenchefs"},
    it:{main:"SUGGERIMENTO",script:"dello Chef"},
    ru:{main:"РЕКОМЕНДАЦИЯ",script:"шеф-повара"}
  };


  const foodCats = {
    couvert:"Couvert",
    starters:{pt:"Entradas",en:"Starters",fr:"Entrées",es:"Entradas",de:"Vorspeisen",it:"Antipasti",ru:"Закуски"}[lang]||"Entradas",
    vegetarian:{pt:"Vegetariano",en:"Vegetarian",fr:"Végétarien",es:"Vegetariano",de:"Vegetarisch",it:"Vegetariano",ru:"Вегетарианские блюда"}[lang]||"Vegetariano",
    fish:{pt:"Peixes",en:"Fish",fr:"Poissons",es:"Pescado",de:"Fisch",it:"Pesce",ru:"Рыбные блюда"}[lang]||"Peixes",
    meat:{pt:"Carnes",en:"Meat",fr:"Viandes",es:"Carne",de:"Fleisch",it:"Carne",ru:"Мясные блюда"}[lang]||"Carnes",
    desserts:{pt:"Sobremesas",en:"Desserts",fr:"Desserts",es:"Postres",de:"Nachtisch",it:"Dessert",ru:"Десерты"}[lang]||"Sobremesas"
  };

  const drinkCats = {
    wine_green_white:"Vinhos Verdes Brancos",
    wine_white:"Vinhos Maduros Brancos",
    wine_green_red:"Vinhos Verdes Tintos",
    wine_red:"Vinhos Maduros Tintos",
    rose:"Vinhos Rosé",
    sparkling:"Espumantes",
    soft:"Águas e Refrigerantes",
    beer:"Cervejas",
    sangria:"Sangrias",
    digestif:"Aperitivos / Digestivos",
    hot:"Quentes"
  };
  const cats = {...foodCats,...drinkCats};

  function escapeAttr(s){
    return String(s||"")
      .replace(/&/g,"&amp;")
      .replace(/"/g,"&quot;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;");
  }

  function applyHeader(){
    $("pageTitle").textContent=L.title;
    $("pageSubtitle").textContent=L.sub;
    $("foodBtn").textContent=L.food;
    $("drinkBtn").textContent=L.drinks;
    document.querySelectorAll(".menu-language-flags a").forEach(a=>{
      a.classList.toggle("active",a.dataset.lang===lang);
    });
  }

  function renderChefSuggestion(){
    const block=data.chefSuggestion;
    const section=$("chefSuggestion");
    if(!block || block.enabled===false){
      section.hidden=true;
      return;
    }
    const items=(block.items||[]).filter(x=>x.available!==false);
    if(!items.length){
      section.hidden=true;
      return;
    }
    section.hidden=false;

    {
      const parts=chefTitleParts[lang]||chefTitleParts.pt;
      $("chefTitleMain").textContent=parts.main;
      $("chefTitleScript").textContent=parts.script;
    }

    if($("chefSubtitle")) if($("chefSubtitle")) $("chefSubtitle").textContent=block.subtitle?.[lang]||block.subtitle?.pt||"";

    const typeLabels={
      Entrada:{pt:"ENTRADA",en:"STARTER",fr:"ENTRÉE",es:"ENTRADA",de:"VORSPEISE",it:"ANTIPASTO",ru:"ЗАКУСКА"},
      Peixe:{pt:"PEIXE",en:"FISH",fr:"POISSON",es:"PESCADO",de:"FISCH",it:"PESCE",ru:"РЫБА"},
      Carne:{pt:"CARNE",en:"MEAT",fr:"VIANDE",es:"CARNE",de:"FLEISCH",it:"CARNE",ru:"МЯСО"}
    };

    $("chefGrid").innerHTML=items.map(item=>{
      const name=item.name?.[lang]||item.name?.pt||"";
      const desc=item.description?.[lang]||item.description?.pt||"";
      const itemType=typeLabels[item.type]?.[lang]||item.type||"";
      const image=item.imageData||item.image||"assets/dish-placeholder.svg";

      return `<article class="chef-card">
        <div class="chef-card-header">
          <span class="chef-type">${itemType}</span>
          <h3>${name}</h3>
        </div>
        <div class="chef-image-wrap">
          <img class="chef-image zoomable" src="${image}"
               data-full="${image}"
               data-caption="${escapeAttr(name)}"
               alt="${escapeAttr(name)}"
               onerror="this.onerror=null;this.src='assets/dish-placeholder.svg'">
          <div class="chef-price">${euro(item.price)}</div>
        </div>
        <div class="chef-card-body">
          <p>${desc}</p>
        </div>
      </article>`;
    }).join("");

    wireImageZoom();
  }

  function renderCats(){
    const arr=type==="food"?data.food:data.beverages;
    const ks=[...new Set(arr.filter(x=>x.available!==false).map(x=>x.category))];

    $("categoryStrip").innerHTML=[
      ["all",L.all],
      ...ks.map(k=>[k,cats[k]||k])
    ].map(([k,n])=>`<button class="cat-btn ${cat===k?"active":""}" data-c="${k}">${n}</button>`).join("");

    document.querySelectorAll(".cat-btn").forEach(b=>{
      b.onclick=()=>{
        cat=b.dataset.c;
        renderCats();
        renderMenu();
      };
    });
  }

  function renderMenu(){
    const arr=(type==="food"?data.food:data.beverages)
      .filter(x=>x.available!==false && (cat==="all"||x.category===cat));

    const grouped={};
    arr.forEach(x=>(grouped[x.category]??=[]).push(x));

    $("menuContent").innerHTML=Object.entries(grouped).map(([k,items],idx)=>{
      const rows=items.map(x=>{
        if(type==="food"){
          const name=x.name?.[lang]||x.name?.pt||"";
          const desc=x.description?.[lang]||x.description?.pt||"";
          const image=x.imageData||x.image||"assets/dish-placeholder.svg";
          return `<article class="dish">
            <img class="dish-image zoomable" src="${image}"
                 onerror="this.onerror=null;this.src='assets/dish-placeholder.svg'"
                 alt="${escapeAttr(name)}" data-full="${image}" data-caption="${escapeAttr(name)}">
            <div>
              <h3>${name}</h3>
              ${desc?`<p>${desc}</p>`:""}
            </div>
            <div class="price">${euro(x.price)}</div>
          </article>`;
        }
        return `<article class="dish">
          <img src="assets/drink-placeholder.svg" alt="">
          <div><h3>${x.name}</h3>${x.region?`<p>${x.region}</p>`:""}</div>
          <div class="price">${euro(x.bottle)}${x.glass?`<div class="tiny">Copo ${euro(x.glass)}</div>`:""}</div>
        </article>`;
      }).join("");

      return `<section class="section ${idx===0?"first-menu-section":""}">
        <div class="section-heading">
          <h2>${cats[k]||k}</h2>
          ${idx===0 && type==="food" ? `<span>${L.introText}</span><i></i>` : ""}
        </div>
        ${rows}
      </section>`;
    }).join("");

    wireImageZoom();
  }

  function wireImageZoom(){
    document.querySelectorAll(".zoomable").forEach(img=>{
      if(img.dataset.zoomBound==="1") return;
      img.dataset.zoomBound="1";
      img.onclick=()=>{
        $("lightboxImage").src=img.dataset.full||img.src;
        $("lightboxCaption").textContent=img.dataset.caption||img.alt||"";
        $("imageLightbox").classList.add("open");
        document.body.classList.add("modal-open");
      };
    });
  }

  const scrollToMenuArea=()=>{
    const target=$("menuArea");
    if(!target) return;
    const y=target.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({top:y, behavior:"smooth"});
  };

  $("foodBtn").onclick=()=>{
    type="food"; cat="all";
    $("foodBtn").classList.add("active");
    $("drinkBtn").classList.remove("active");
    renderCats(); renderMenu();
    requestAnimationFrame(()=>requestAnimationFrame(scrollToMenuArea));
  };
  $("drinkBtn").onclick=()=>{
    type="beverages"; cat="all";
    $("drinkBtn").classList.add("active");
    $("foodBtn").classList.remove("active");
    renderCats(); renderMenu();
    requestAnimationFrame(()=>requestAnimationFrame(scrollToMenuArea));
  };

  $("lightboxClose").onclick=()=>{
    $("imageLightbox").classList.remove("open");
    document.body.classList.remove("modal-open");
  };
  $("imageLightbox").onclick=e=>{
    if(e.target===$("imageLightbox")) $("lightboxClose").click();
  };

  applyHeader();
  renderChefSuggestion();
  renderCats();
  renderMenu();
})();