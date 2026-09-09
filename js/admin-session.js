(()=>{
  const EDITS_KEY="colherdpau_session_edited";
  const ACTIVE_TYPE_KEY="colherdpau_active_type";
  const INTERNAL_RELOAD_KEY="colherdpau_internal_reload";

  const internalReload=sessionStorage.getItem(INTERNAL_RELOAD_KEY)==="1";

  if(!internalReload){
    sessionStorage.removeItem(EDITS_KEY);
    sessionStorage.removeItem(ACTIVE_TYPE_KEY);
  }else{
    sessionStorage.removeItem(INTERNAL_RELOAD_KEY);
  }

  function readEdits(){
    try{
      return {food:[],beverages:[],chef:[],...JSON.parse(sessionStorage.getItem(EDITS_KEY)||"{}")};
    }catch{
      return {food:[],beverages:[],chef:[]};
    }
  }

  function activeType(){
    return document.querySelector(".admin-tab.active")?.dataset.type||"food";
  }

  function applyHighlights(){
    const type=activeType();
    const edits=readEdits();
    const editedIndexes=new Set((edits[type]||[]).map(Number));
    document.querySelectorAll("#rows tr[data-i]").forEach(row=>{
      row.classList.toggle("edited-row",editedIndexes.has(Number(row.dataset.i)));
    });
  }

  function restoreActiveTab(){
    if(!internalReload)return;
    const wanted=sessionStorage.getItem(ACTIVE_TYPE_KEY);
    if(!wanted)return;
    const btn=document.querySelector(`.admin-tab[data-type="${wanted}"]`);
    if(btn&&!btn.classList.contains("active"))btn.click();
  }

  const rows=document.getElementById("rows");
  if(rows){
    new MutationObserver(()=>applyHighlights()).observe(rows,{childList:true});
  }

  document.querySelectorAll(".admin-tab").forEach(btn=>{
    btn.addEventListener("click",()=>setTimeout(applyHighlights,0));
  });

  setTimeout(()=>{
    restoreActiveTab();
    applyHighlights();
  },0);
})();