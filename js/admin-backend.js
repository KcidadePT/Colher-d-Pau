(()=>{
  "use strict";
  const $=id=>document.getElementById(id);
  let currentType="food";
  let currentIndex=0;

  const SESSION_EDITS_KEY="colherdpau_session_edited";
  const ACTIVE_TYPE_KEY="colherdpau_active_type";
  const INTERNAL_RELOAD_KEY="colherdpau_internal_reload";

  function auth(){return window.COLHERDPAU_GET_AUTH?.()||{apiUrl:"",token:""};}
  function currentData(){return window.MENU_DATA||{food:[],beverages:[],chefSuggestion:{items:[]}};}
  function rememberEditedItem(type,index){
    let state={food:[],beverages:[],chef:[]};
    try{state={...state,...JSON.parse(sessionStorage.getItem(SESSION_EDITS_KEY)||"{}")} }catch{}
    state[type]=Array.from(new Set([...(state[type]||[]),Number(index)]));
    sessionStorage.setItem(SESSION_EDITS_KEY,JSON.stringify(state));
    sessionStorage.setItem(ACTIVE_TYPE_KEY,type);
  }
  function setStatus(text,kind=""){
    const el=$("githubSyncStatus");if(!el)return;
    el.textContent=text;el.className="github-sync-status"+(kind?" "+kind:"");
  }
  function setPublish(text,kind=""){
    const el=$("publishState");if(!el)return;
    el.textContent=text;el.className="publish-state"+(kind?" "+kind:"");
  }
  function safeImageFileName(name){
    const raw=(name||"fotografia").replace(/\.[^.]+$/,"");
    const safe=raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"")||"fotografia";
    return safe+"-"+Date.now()+".jpg";
  }
  async function fileToOptimizedDataUrl(file){
    if(!file)return null;
    const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
    const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=dataUrl});
    const max=1600;let w=img.naturalWidth,h=img.naturalHeight;
    if(Math.max(w,h)>max){const scale=max/Math.max(w,h);w=Math.round(w*scale);h=Math.round(h*scale)}
    const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;canvas.getContext("2d").drawImage(img,0,0,w,h);
    return canvas.toDataURL("image/jpeg",0.86);
  }
  function applyFields(data){
    const arr=currentType==="food"?data.food:currentType==="beverages"?data.beverages:data.chefSuggestion.items;
    const x=arr[currentIndex];
    if(!x)throw new Error("Não foi possível localizar o item a editar.");
    x.available=$("available").checked;x.image=$("image").value.trim();
    if(currentType==="food"){
      x.category=$("category").value;x.code=$("code").value.trim();x.name=x.name||{};x.name.pt=$("name_pt").value.trim();x.description=x.description||{};x.description.pt=$("desc_pt").value.trim();x.price=parseFloat($("price").value)||0;x.allergens=$("allergens").value.split(",").map(s=>s.trim()).filter(Boolean);x.tags=$("tags").value.split(",").map(s=>s.trim()).filter(Boolean);x.featured=$("featured").checked;
    }else if(currentType==="beverages"){
      x.category=$("category").value;x.name=$("name_pt").value.trim();x.bottle=parseFloat($("price").value)||0;const g=$("glass").value.trim();x.glass=g===""?null:(parseFloat(g)||0);x.region=$("region").value.trim();
    }else{
      x.type=$("category").value;x.id=$("code").value.trim();x.name=x.name||{};x.name.pt=$("name_pt").value.trim();x.description=x.description||{};x.description.pt=$("desc_pt").value.trim();x.price=parseFloat($("price").value)||0;
    }
    return x;
  }
  function cleanDataForPublish(source){
    const copy=JSON.parse(JSON.stringify(source));
    for(const x of copy.food||[])delete x.imageData;
    for(const x of copy.beverages||[])delete x.imageData;
    for(const x of copy.chefSuggestion?.items||[])delete x.imageData;
    return copy;
  }

  document.addEventListener("click",e=>{
    const row=e.target.closest?.("#rows tr[data-i]");if(row){currentIndex=Number(row.dataset.i);currentType=document.querySelector(".admin-tab.active")?.dataset.type||"food"}
    const tab=e.target.closest?.(".admin-tab");if(tab)currentType=tab.dataset.type;
  },true);

  const connect=$("connectGitHub");
  if(connect){connect.textContent="Terminar sessão";connect.onclick=()=>window.COLHERDPAU_LOGOUT?.();}

  const apply=$("apply");
  if(apply){
    apply.onclick=async()=>{
      const session=auth();
      if(!session.apiUrl||!session.token){setPublish("Sessão inválida. Volte a iniciar sessão com Google.","error");return;}
      const old=apply.textContent;apply.disabled=true;apply.textContent="A publicar…";setPublish("A publicar no GitHub…","busy");
      try{
        const data=currentData();
        const item=applyFields(data);let image=null;const file=$("imageUpload").files?.[0];
        if(file){
          const optimized=await fileToOptimizedDataUrl(file);
          const path="assets/dishes/"+safeImageFileName(file.name);
          $("image").value=path;item.image=path;image={path,base64:optimized.split(",")[1]};
        }
        const payload={data:cleanDataForPublish(data),image};
        const res=await fetch(session.apiUrl+"/publish",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.token},body:JSON.stringify(payload)});
        const body=await res.json().catch(()=>({}));
        if(res.status===401){window.COLHERDPAU_LOGOUT?.();return;}
        if(!res.ok||!body.ok)throw new Error(body.error||"Não foi possível publicar.");
        setPublish("Publicado no GitHub.","ok");setStatus("GitHub sincronizado","connected");
        rememberEditedItem(currentType,currentIndex);sessionStorage.setItem(INTERNAL_RELOAD_KEY,"1");sessionStorage.setItem(ACTIVE_TYPE_KEY,currentType);
        setTimeout(()=>location.href=location.pathname+"?v="+Date.now(),500);
      }catch(e){setPublish(e.message||"Não foi possível publicar no GitHub.","error");setStatus("Erro de sincronização","error");}
      finally{apply.disabled=false;apply.textContent=old;}
    };
  }
})();