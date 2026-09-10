(()=>{
  "use strict";
  const lang=(document.documentElement.lang||new URLSearchParams(location.search).get("lang")||"pt").toLowerCase();
  const translations={
    "CHEF-ENTRADA":{
      name:{en:"Minho-style sarrabulho porridge",fr:"Papas de sarrabulho à la mode du Minho",es:"Papas de sarrabulho al estilo del Miño",de:"Sarrabulho nach Minho-Art",it:"Papas de sarrabulho alla maniera del Minho",ru:"Папас де саррабулью по-миньотски"},
      description:{en:"A classic from Minho cuisine, rich in tradition and flavour.",fr:"Un classique de la cuisine du Minho, riche en tradition et en saveurs.",es:"Un clásico de la cocina del Miño, lleno de tradición y sabor.",de:"Ein Klassiker der Küche des Minho, voller Tradition und Geschmack.",it:"Un classico della cucina del Minho, ricco di tradizione e sapore.",ru:"Классическое блюдо кухни Минью, насыщенное традицией и вкусом."}
    },
    "CHEF-PEIXE":{
      name:{en:"Flaked cod with cornbread and turnip greens",fr:"Morue effilochée à la broa et aux fanes de navet",es:"Bacalao desmigado con broa y grelos",de:"Gezupfter Kabeljau mit Maisbrot und Stängelkohl",it:"Baccalà a scaglie con broa e cime di rapa",ru:"Треска хлопьями с кукурузным хлебом и зеленью репы"},
      description:{en:"Flaked cod with crisp cornbread, punched potatoes and turnip greens, in a perfectly balanced combination of flavours.",fr:"Morue effilochée, broa croustillante, pommes de terre au poing et fanes de navet, dans une association de saveurs parfaitement équilibrée.",es:"Lascas de bacalao, broa crujiente, patatas al puño y grelos, en una combinación perfecta de sabores.",de:"Gezupfter Kabeljau mit knusprigem Maisbrot, Stampfkartoffeln und Stängelkohl – eine harmonische Geschmackskombination.",it:"Baccalà a scaglie, broa croccante, patate schiacciate e cime di rapa, in un perfetto equilibrio di sapori.",ru:"Треска хлопьями, хрустящий кукурузный хлеб, запечённый картофель и зелень репы в гармоничном сочетании вкусов."}
    },
    "CHEF-CARNE":{
      name:{en:"Picanha with cornbread",fr:"Picanha à la broa",es:"Picanha con broa",de:"Picanha mit Maisbrot",it:"Picanha con broa",ru:"Пиканья с кукурузным хлебом"},
      description:{en:"Juicy picanha, grilled just right and served with traditional cornbread.",fr:"Picanha juteuse, grillée à point et accompagnée de broa traditionnelle.",es:"Picanha jugosa, asada en su punto y acompañada de broa tradicional.",de:"Saftige Picanha, auf den Punkt gegrillt und mit traditionellem Maisbrot serviert.",it:"Picanha succosa, grigliata al punto giusto e servita con broa tradizionale.",ru:"Сочная пиканья, приготовленная на гриле до идеальной степени и поданная с традиционным кукурузным хлебом."}
    }
  };

  function fitChefTitle(){
    if(innerWidth>600)return;
    const row=document.querySelector(".chef-title-row");
    const main=document.getElementById("chefTitleMain");
    const script=document.getElementById("chefTitleScript");
    if(!row||!main||!script)return;
    main.style.fontSize="";script.style.fontSize="";
    let size=30;
    main.style.fontSize=size+"px";script.style.fontSize=size+"px";
    const min=15;
    while(row.scrollWidth>row.clientWidth&&size>min){size-=1;main.style.fontSize=size+"px";script.style.fontSize=size+"px";}
  }

  function applyTranslations(){
    if(lang==="pt")return;
    document.querySelectorAll("#chefGrid .chef-card[data-key]").forEach(card=>{
      const key=card.dataset.key||"";
      const id=Object.keys(translations).find(x=>key.includes(x));
      if(!id)return;
      const t=translations[id];
      const h3=card.querySelector("h3");
      const p=card.querySelector(".chef-card-body p");
      if(h3&&t.name[lang])h3.textContent=t.name[lang];
      if(p&&t.description[lang])p.textContent=t.description[lang];
      const img=card.querySelector("img.zoomable");
      if(img&&t.name[lang]){img.alt=t.name[lang];img.dataset.caption=t.name[lang];}
    });
  }

  let scheduled=false;
  function refresh(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;applyTranslations();fitChefTitle();});
  }

  const target=document.getElementById("chefSuggestion")||document.body;
  new MutationObserver(refresh).observe(target,{childList:true,subtree:true,characterData:true});
  addEventListener("resize",refresh,{passive:true});
  addEventListener("load",refresh);
  document.addEventListener("DOMContentLoaded",refresh);
  refresh();
})();