(()=>{
let data=JSON.parse(localStorage.getItem("colherdpau_menu_data")||JSON.stringify(window.MENU_DATA));
let currentIndex=0;
let currentType="food";
const edited={food:new Set(),beverages:new Set(),chef:new Set()};
const $=id=>document.getElementById(id);

const foodCategories=[
  ["couvert","Couvert"],
  ["starters","Entradas"],
  ["vegetarian","Vegetariano"],
  ["fish","Peixes"],
  ["meat","Carnes"],
  ["desserts","Sobremesas"]
];

const chefTypes=[["Entrada","Entrada"],["Peixe","Peixe"],["Carne","Carne"]];

const beverageCategories=[
  ["wine_green_white","Vinhos · Brancos · Verdes"],
  ["wine_white","Vinhos · Brancos · Maduros"],
  ["wine_green_red","Vinhos · Tintos · Verdes"],
  ["wine_red","Vinhos · Tintos · Maduros"],
  ["rose","Vinhos · Rosé"],
  ["sparkling","Espumantes"],
  ["soft","Águas e Refrigerantes"],
  ["beer","Cervejas"],
  ["sangria","Sangrias"],
  ["digestif","Aperitivos / Digestivos"],
  ["hot","Quentes"]
];

function categoryOptions(){
  if(currentType==="food") return foodCategories;
  if(currentType==="beverages") return beverageCategories;
  return chefTypes;
}

function categoryLabel(key){
  const found=[...foodCategories,...beverageCategories].find(x=>x[0]===key);
  return found?found[1]:key;
}

function renderHead(){
  if(currentType==="food"){
    $("tableHead").innerHTML="<tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Disponível</th></tr>";
  }else if(currentType==="beverages"){
    $("tableHead").innerHTML="<tr><th>Nome</th><th>Categoria</th><th>Região</th><th>Garrafa</th><th>Copo</th></tr>";
  }else{
    $("tableHead").innerHTML="<tr><th>ID</th><th>Tipo</th><th>Nome PT</th><th>Preço</th><th>Disponível</th></tr>";
  }
}

function renderRows(){
  renderHead();
  let arr;
  if(currentType==="food") arr=data.food;
  else if(currentType==="beverages") arr=data.beverages;
  else arr=(data.chefSuggestion?.items||[]);

  $("rows").innerHTML=arr.map((x,i)=>{
    const changed=edited[currentType].has(i)?" edited-row":"";
    if(currentType==="food"){
      return `<tr class="${changed}" data-i="${i}">
        <td>${x.code||""}</td>
        <td>${x.name?.pt||""}</td>
        <td>${categoryLabel(x.category)}</td>
        <td>${Number(x.price||0).toFixed(2)} €</td>
        <td>${x.available===false?"Não":"Sim"}</td>
      </tr>`;
    }
    if(currentType==="beverages"){
      return `<tr class="${changed}" data-i="${i}">
        <td>${x.name||""}</td>
        <td>${categoryLabel(x.category)}</td>
        <td>${x.region||""}</td>
        <td>${Number(x.bottle||0).toFixed(2)} €</td>
        <td>${x.glass?Number(x.glass).toFixed(2)+" €":"—"}</td>
      </tr>`;
    }
    return `<tr class="${changed}" data-i="${i}">
      <td>${x.id||""}</td>
      <td>${x.type||""}</td>
      <td>${x.name?.pt||""}</td>
      <td>${Number(x.price||0).toFixed(2)} €</td>
      <td>${x.available===false?"Não":"Sim"}</td>
    </tr>`;
  }).join("");

  document.querySelectorAll("#rows tr").forEach(r=>{
    r.onclick=()=>openEditor(+r.dataset.i);
  });
}

function fillCategorySelect(selected){
  $("category").innerHTML=categoryOptions().map(([value,label])=>
    `<option value="${value}" ${value===selected?"selected":""}>${label}</option>`
  ).join("");
}

function setFieldVisibility(){
  const food=currentType==="food";
  const beverages=currentType==="beverages";
  const chef=currentType==="chef";
  $("descriptionField").style.display=(food||chef)?"flex":"none";
  $("allergensField").style.display=food?"flex":"none";
  $("tagsField").style.display=food?"flex":"none";
  $("featuredField").style.display=food?"flex":"none";
  $("regionField").style.display=beverages?"flex":"none";
  $("glassField").style.display=beverages?"flex":"none";
}

function openEditor(i){
  currentIndex=i;
  setFieldVisibility();
  let x;
  if(currentType==="food") x=data.food[i];
  else if(currentType==="beverages") x=data.beverages[i];
  else x=data.chefSuggestion.items[i];

  fillCategorySelect(currentType==="chef"?x.type:x.category);
  $("available").checked=x.available!==false;

  if(currentType==="food"){
    $("modalTitle").textContent="Editar prato";
    $("code").parentElement.style.display="flex";
    $("code").value=x.code||"";
    $("name_pt").value=x.name?.pt||"";
    $("desc_pt").value=x.description?.pt||"";
    $("price").value=x.price??"";
    $("glass").value="";
    $("region").value="";
    $("image").value=x.image||"";
    $("allergens").value=(x.allergens||[]).join(", ");
    $("tags").value=(x.tags||[]).join(", ");
    $("featured").checked=!!x.featured;
  }else if(currentType==="beverages"){
    $("modalTitle").textContent="Editar bebida";
    $("code").parentElement.style.display="none";
    $("name_pt").value=x.name||"";
    $("desc_pt").value="";
    $("price").value=x.bottle??"";
    $("glass").value=x.glass??"";
    $("region").value=x.region||"";
    $("image").value=x.image||"";
    $("allergens").value="";
    $("tags").value="";
    $("featured").checked=false;
  }else{
    $("modalTitle").textContent="Editar Sugestão do Chefe";
    $("code").parentElement.style.display="flex";
    $("code").value=x.id||"";
    $("name_pt").value=x.name?.pt||"";
    $("desc_pt").value=x.description?.pt||"";
    $("price").value=x.price??"";
    $("glass").value="";
    $("region").value="";
    $("image").value=x.image||"";
    $("allergens").value="";
    $("tags").value="";
    $("featured").checked=false;
  }

  preview();
  $("editorModal").classList.add("open");
  $("editorModal").setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
}

function closeEditor(){
  $("editorModal").classList.remove("open");
  $("editorModal").setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}

function preview(){
  $("preview").src=$("image").value || (currentType==="beverages"?"assets/drink-placeholder.svg":"assets/dish-placeholder.svg");
  $("preview").onerror=()=>{$("preview").src=currentType==="beverages"?"assets/drink-placeholder.svg":"assets/dish-placeholder.svg"};
}

$("image").oninput=preview;

$("apply").onclick=()=>{
  let arr;
  if(currentType==="food") arr=data.food;
  else if(currentType==="beverages") arr=data.beverages;
  else arr=data.chefSuggestion.items;
  const x=arr[currentIndex];

  x.available=$("available").checked;
  x.image=$("image").value;

  if(currentType==="food"){
    x.category=$("category").value;
    x.code=$("code").value.trim();
    x.name=x.name||{};
    x.name.pt=$("name_pt").value.trim();
    x.description=x.description||{};
    x.description.pt=$("desc_pt").value.trim();
    x.price=parseFloat($("price").value)||0;
    x.allergens=$("allergens").value.split(",").map(s=>s.trim()).filter(Boolean);
    x.tags=$("tags").value.split(",").map(s=>s.trim()).filter(Boolean);
    x.featured=$("featured").checked;
  }else if(currentType==="beverages"){
    x.category=$("category").value;
    x.name=$("name_pt").value.trim();
    x.bottle=parseFloat($("price").value)||0;
    const glassVal=$("glass").value.trim();
    x.glass=glassVal===""?null:(parseFloat(glassVal)||0);
    x.region=$("region").value.trim();
  }else{
    x.type=$("category").value;
    x.id=$("code").value.trim();
    x.name=x.name||{};
    x.name.pt=$("name_pt").value.trim();
    x.description=x.description||{};
    x.description.pt=$("desc_pt").value.trim();
    x.price=parseFloat($("price").value)||0;
  }

  edited[currentType].add(currentIndex);
  renderRows();
  closeEditor();
};

$("closeModal").onclick=closeEditor;
$("cancelModal").onclick=closeEditor;
$("editorModal").addEventListener("click",e=>{if(e.target===$("editorModal"))closeEditor()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("editorModal").classList.contains("open"))closeEditor()});

document.querySelectorAll(".admin-tab").forEach(btn=>{
  btn.onclick=()=>{
    currentType=btn.dataset.type;
    document.querySelectorAll(".admin-tab").forEach(b=>b.classList.toggle("active",b===btn));
    refreshChefSettings();
    renderRows();
  };
});

$("save").onclick=()=>{
  localStorage.setItem("colherdpau_menu_data",JSON.stringify(data));
  alert("Alterações guardadas neste navegador.");
};

$("reset").onclick=()=>{
  if(confirm("Repor os dados originais?")){
    localStorage.removeItem("colherdpau_menu_data");
    data=JSON.parse(JSON.stringify(window.MENU_DATA));
    edited.food.clear();
    edited.beverages.clear();
    edited.chef.clear();
    renderRows();
  }
};

$("export").onclick=()=>{
  const blob=new Blob(["window.MENU_DATA = "+JSON.stringify(data,null,2)+";\n"],{type:"text/javascript"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="data.js";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};


function refreshChefSettings(){
  const isChef=currentType==="chef";
  $("chefAdminSettings").hidden=!isChef;
  if(isChef){
    data.chefSuggestion=data.chefSuggestion||{enabled:true,validUntil:"",items:[]};
    $("chefEnabled").checked=data.chefSuggestion.enabled!==false;
    $("chefValidUntil").value=data.chefSuggestion.validUntil||"";
  }
}
$("chefEnabled").onchange=()=>{data.chefSuggestion.enabled=$("chefEnabled").checked;};
$("chefValidUntil").onchange=()=>{data.chefSuggestion.validUntil=$("chefValidUntil").value;};
$("addChefItem").onclick=()=>{
  data.chefSuggestion=data.chefSuggestion||{enabled:true,validUntil:"",items:[]};
  data.chefSuggestion.items.push({
    id:"CHEF-"+String(data.chefSuggestion.items.length+1).padStart(2,"0"),
    type:"Entrada",
    name:{pt:"Nova sugestão",en:"",fr:"",es:"",de:"",it:"",ru:""},
    description:{pt:"",en:"",fr:"",es:"",de:"",it:"",ru:""},
    price:0,
    image:"",
    available:true
  });
  edited.chef.add(data.chefSuggestion.items.length-1);
  renderRows();
  openEditor(data.chefSuggestion.items.length-1);
};

refreshChefSettings();
renderRows();
})();