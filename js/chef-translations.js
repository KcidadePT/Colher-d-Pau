(()=>{
  "use strict";

  const translations={
    "CHEF-ENTRADA":{
      name:{en:"Minho-style sarrabulho porridge",fr:"Papas de sarrabulho du Minho",es:"Papas de sarrabulho al estilo del Miño",de:"Sarrabulho nach Minho-Art",it:"Papas de sarrabulho alla maniera del Minho",ru:"Папаш де саррабулью по-миньотски"},
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

  function apply(data){
    const items=data?.chefSuggestion?.items;
    if(!Array.isArray(items))return data;
    for(const item of items){
      const t=translations[item.id];
      if(!t)continue;
      item.name=item.name||{};
      item.description=item.description||{};
      for(const [lang,value] of Object.entries(t.name)) if(!item.name[lang]) item.name[lang]=value;
      for(const [lang,value] of Object.entries(t.description)) if(!item.description[lang]) item.description[lang]=value;
    }
    return data;
  }

  if(window.MENU_DATA)apply(window.MENU_DATA);

  const originalFetch=window.fetch.bind(window);
  window.fetch=async(...args)=>{
    const response=await originalFetch(...args);
    const url=String(args[0]?.url||args[0]||"");
    if(!url.includes("/menu-data"))return response;
    try{
      const payload=await response.clone().json();
      if(payload?.data)apply(payload.data);
      return new Response(JSON.stringify(payload),{
        status:response.status,
        statusText:response.statusText,
        headers:response.headers
      });
    }catch{return response;}
  };
})();
