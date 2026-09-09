(()=>{
  const $=id=>document.getElementById(id);
  let apiUrl=localStorage.getItem("colherdpau_admin_api_url")||"";
  let adminKey=sessionStorage.getItem("colherdpau_admin_key")||"";
  let currentType="food";
  let currentIndex=0;
  let data=JSON.parse(JSON.stringify(window.MENU_DATA));

  const SESSION_EDITS_KEY="colherdpau_session_edited";
  const ACTIVE_TYPE_KEY="colherdpau_active_type";
  const INTERNAL_RELOAD_KEY="colherdpau_internal_reload";

  function rememberEditedItem(type,index){
    let state={food:[],beverages:[],chef:[]};
    try{state={...state,...JSON.parse(sessionStorage.getItem(SESSION_EDITS_KEY)||"{}")} }catch{}
    state[type]=Array.from(new Set([...(state[type]||[]),Number(index)]));
    sessionStorage.setItem(SESSION_EDITS_KEY,JSON.stringify(state));
    sessionStorage.setItem(ACTIVE_TYPE_KEY,type);
  }

  function setStatus(text,kind=""){
    const el=$("githubSyncStatus");
    if(!el)return;
    el.textContent=text;
    el.className="github-sync-status"+(kind?" "+kind:"");
  }
  function setPublish(text,kind=""){
    const el=$("publishState");
    if(!el)return;
    el.textContent=text;
    el.className="publish-state"+(kind?" "+kind:"");
  }

  async function configureBackend(){
    const url=prompt("Cole o endereço do backend do backoffice (Cloudflare Worker).",apiUrl);
    if(!url)return false;
    const key=prompt("Introduza a palavra-passe do backoffice.","");
    if(!key)return false;
    apiUrl=url.trim().replace(/\/$/,"");
    adminKey=key.trim();
    localStorage.setItem("colherdpau_admin_api_url",apiUrl);
    sessionStorage.setItem("colherdpau_admin_key",adminKey);
    try{
      const res=await fetch(apiUrl+"/health",{method:"POST",headers:{"X-Admin-Key":adminKey}});
      const body=await res.json().catch(()=>({}));
      if(!res.ok||!body.ok)throw new Error(body.error||"Não foi possível ligar ao backoffice.");
      setStatus("Backoffice ligado","connected");
      $("connectGitHub").textContent="Backoffice ligado";
      return true;
    }catch(e){
      setStatus(e.message||"Erro de ligação","error");
      return false;
    }
  }

  function backendConfigured(){return !!(apiUrl&&adminKey)}

  function safeImageFileName(name){
    const raw=(name||"fotografia").replace(/\.[^.]+$/,"");
    const safe=raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"")||"fotografia";
    return safe+".jpg";
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

  function applyFields(){
    let arr=currentType==="food"?data.food:currentType==="beverages"?data.beverages:data.chefSuggestion.items;
    const x=arr[currentIndex];
    x.available=$("available").checked;
    x.image=$("image").value.trim();
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
    const row=e.target.closest?.("#rows tr[data-i]");
    if(row){currentIndex=Number(row.dataset.i);currentType=document.querySelector(".admin-tab.active")?.dataset.type||"food"}
    const tab=e.target.closest?.(".admin-tab");
    if(tab)currentType=tab.dataset.type;
  },true);

  const connect=$("connectGitHub");
  if(connect){
    connect.textContent=backendConfigured()?"Backoffice ligado":"Configurar publicação";
    setStatus(backendConfigured()?"Backoffice ligado":"Gravação local ativa",backendConfigured()?"connected":"");
    connect.onclick=configureBackend;
  }

  const apply=$("apply");
  if(apply){
    apply.onclick=async()=>{
      const old=apply.textContent;
      apply.disabled=true;
      apply.textContent=backendConfigured()?"A publicar…":"A guardar…";
      setPublish(backendConfigured()?"A publicar…":"A guardar…","busy");
      try{
        const item=applyFields();
        let image=null;
        const file=$("imageUpload").files?.[0];
        if(file){
          const optimized=await fileToOptimizedDataUrl(file);
          const path="assets/dishes/"+safeImageFileName(file.name);
          $("image").value=path;
          item.image=path;
          item.imageData=optimized;
          image={path,base64:optimized.split(",")[1]};
        }

        localStorage.setItem("colherdpau_menu_data",JSON.stringify(data));

        if(backendConfigured()){
          const payload={data:cleanDataForPublish(data),image};
          const res=await fetch(apiUrl+"/publish",{method:"POST",headers:{"Content-Type":"application/json","X-Admin-Key":adminKey},body:JSON.stringify(payload)});
          const body=await res.json().catch(()=>({}));
          if(!res.ok||!body.ok)throw new Error(body.error||"Não foi possível publicar.");
          setPublish("Publicado.","ok");
          setStatus("Backoffice sincronizado","connected");
        }else{
          setPublish("Guardado neste navegador.","ok");
          setStatus("Gravação local ativa");
        }

        rememberEditedItem(currentType,currentIndex);
        sessionStorage.setItem(INTERNAL_RELOAD_KEY,"1");
        sessionStorage.setItem(ACTIVE_TYPE_KEY,currentType);
        setTimeout(()=>location.reload(),300);
      }catch(e){
        localStorage.setItem("colherdpau_menu_data",JSON.stringify(data));
        setPublish((e.message||"Não foi possível publicar.")+" As alterações ficaram guardadas neste navegador.","error");
        if(/credenciais/i.test(e.message||"")){sessionStorage.removeItem("colherdpau_admin_key");adminKey="";setStatus("Gravação local ativa");}
      }finally{
        apply.disabled=false;
        apply.textContent=old;
      }
    };
  }
})();