(()=>{
  "use strict";

  const lang=(new URLSearchParams(location.search).get("lang")||document.documentElement.lang||"pt").toLowerCase();
  const translations={
    "CHEF-ENTRADA":{
      name:{en:"Minho-style sarrabulho porridge",fr:"Papas de sarrabulho du Minho",es:"Papas de sarrabulho al estilo del Miño",de:"Sarrabulho nach Minho-Art",it:"Papas de sarrabulho alla maniera del Minho",ru:"Папас де саррабулью по-миньотски"},
      description:{en:"A classic from Minho cuisine, full of tradition and flavour.",fr:"Un classique de la cuisine du Minho, riche en tradition et en saveurs.",es:"Un clásico de la cocina del Miño, lleno de tradición y sabor.",de:"Ein Klassiker der Küche des Minho, voller Tradition und Geschmack.",it:"Un classico della cucina del Minho, ricco di tradizione e sapore.",ru:"Классическое блюдо кухни Минью, наполненное традициями и вкусом."}
    },
    "CHEF-PEIXE":{
      name:{en:"Flaked cod with cornbread and turnip greens",fr:"Morue effeuillée avec pain de maïs et fanes de navet",es:"Bacalao desmigado con broa y grelos",de:"Gezupfter Kabeljau mit Maisbrot und Stängelkohl",it:"Baccalà sfogliato con pane di mais e cime di rapa",ru:"Треска кусочками с кукурузным хлебом и ботвой репы"},
      description:{en:"Flaked cod, crispy cornbread, punched potatoes and turnip greens in a perfectly balanced combination.",fr:"Morue effeuillée, pain de maïs croustillant, pommes de terre écrasées et fanes de navet dans une combinaison harmonieuse.",es:"Bacalao desmigado, broa crujiente, patatas al puño y grelos en una combinación equilibrada.",de:"Gezupfter Kabeljau, knuspriges Maisbrot, Stampfkartoffeln und Stängelkohl in einer ausgewogenen Kombination.",it:"Baccalà sfogliato, pane di mais croccante, patate schiacciate e cime di rapa in un abbinamento equilibrato.",ru:"Кусочки трески, хрустящий кукурузный хлеб, запечённый картофель и ботва репы в гармоничном сочетании."}
    },
    "CHEF-CARNE":{
      name:{en:"Picanha with cornbread",fr:"Picanha avec pain de maïs",es:"Picanha con broa",de:"Picanha mit Maisbrot",it:"Picanha con pane di mais",ru:"Пиканья с кукурузным хлебом"},
      description:{en:"Juicy picanha, grilled to the ideal doneness and served with traditional cornbread.",fr:"Picanha juteuse, grillée à point et accompagnée de pain de maïs traditionnel.",es:"Picanha jugosa, asada en su punto y acompañada de broa tradicional.",de:"Saftige Picanha, auf den Punkt gegrillt und mit traditionellem Maisbrot serviert.",it:"Picanha succosa, grigliata al punto giusto e servita con pane di mais tradizionale.",ru:"Сочная пиканья, приготовленная на гриле до идеальной степени и поданная с традиционным кукурузным хлебом."}
    }
  };

  function applyToData(data){
    const items=data?.chefSuggestion?.items;
    if(!Array.isArray(items))return data;
    for(const item of items){
      const t=translations[item.id];
      if(!t)continue;
      item.name=item.name||{};
      item.description=item.description||{};
      for(const [code,value] of Object.entries(t.name)) if(!item.name[code]) item.name[code]=value;
      for(const [code,value] of Object.entries(t.description)) if(!item.description[code]) item.description[code]=value;
    }
    return data;
  }

  function applyToDom(){
    if(lang==="pt")return;
    document.querySelectorAll("#chefGrid .chef-card[data-key]").forEach(card=>{
      const key=card.dataset.key||"";
      const id=Object.keys(translations).find(candidate=>key.includes(candidate));
      if(!id)return;
      const t=translations[id];
      const name=t.name[lang];
      const description=t.description[lang];
      const title=card.querySelector("h3");
      const desc=card.querySelector(".chef-card-body p");
      const image=card.querySelector("img.zoomable");
      if(title&&name)title.textContent=name;
      if(desc&&description)desc.textContent=description;
      if(image&&name){image.alt=name;image.dataset.caption=name;}
    });
  }

  function fitTitle(){
    if(innerWidth>600)return;
    const row=document.querySelector("#chefSuggestion .chef-title-row");
    const main=document.getElementById("chefTitleMain");
    const script=document.getElementById("chefTitleScript");
    if(!row||!main||!script)return;
    let size=30;
    main.style.setProperty("font-size",size+"px","important");
    script.style.setProperty("font-size",size+"px","important");
    while(row.scrollWidth>row.clientWidth&&size>14){
      size--;
      main.style.setProperty("font-size",size+"px","important");
      script.style.setProperty("font-size",size+"px","important");
    }
  }

  function refreshUi(){applyToDom();fitTitle();}
  if(window.MENU_DATA)applyToData(window.MENU_DATA);

  const originalFetch=window.fetch.bind(window);
  window.fetch=async(...args)=>{
    const response=await originalFetch(...args);
    const url=String(args[0]?.url||args[0]||"");
    if(!url.includes("/menu-data"))return response;
    try{
      const payload=await response.clone().json();
      if(payload?.data)applyToData(payload.data);
      return new Response(JSON.stringify(payload),{status:response.status,statusText:response.statusText,headers:response.headers});
    }catch{return response;}
  };

  let scheduled=false;
  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;refreshUi();});
  };
  const chef=document.getElementById("chefSuggestion")||document.body;
  new MutationObserver(schedule).observe(chef,{childList:true,subtree:true,characterData:true});
  addEventListener("resize",schedule,{passive:true});
  addEventListener("load",schedule);
  document.addEventListener("DOMContentLoaded",schedule);
  schedule();
})();