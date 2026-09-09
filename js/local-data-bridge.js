(()=>{
  try{
    const saved=localStorage.getItem("colherdpau_menu_data");
    if(!saved)return;
    const local=JSON.parse(saved);
    const applyLocalImage=x=>{
      if(x&&x.imageData)x.image=x.imageData;
    };
    (local.food||[]).forEach(applyLocalImage);
    (local.beverages||[]).forEach(applyLocalImage);
    (local.chefSuggestion?.items||[]).forEach(applyLocalImage);
    window.MENU_DATA=local;
  }catch(e){
    console.warn("Não foi possível carregar os dados locais da carta.",e);
  }
})();