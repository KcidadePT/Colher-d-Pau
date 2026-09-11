(()=>{
  "use strict";

  const API_URL="https://colherdpau-admin-api.joao-c-veloso93.workers.dev";
  const TOKEN_KEY="colherdpau_google_session";
  const gate=document.getElementById("adminAuthGate");
  const app=document.getElementById("adminApp");
  const loginBtn=document.getElementById("googleLoginBtn");
  const errorEl=document.getElementById("adminAuthError");

  function token(){return sessionStorage.getItem(TOKEN_KEY)||"";}
  function setError(message=""){if(errorEl)errorEl.textContent=message;}
  function showApp(){if(gate)gate.hidden=true;if(app)app.hidden=false;document.dispatchEvent(new CustomEvent("colherdpau:auth-ready"));}
  function showLogin(){if(gate)gate.hidden=false;if(app)app.hidden=true;}

  function consumeCallbackToken(){
    const hash=new URLSearchParams(location.hash.replace(/^#/,""));
    const authToken=hash.get("auth_token");
    const authError=hash.get("auth_error");
    if(authToken){
      sessionStorage.setItem(TOKEN_KEY,authToken);
      history.replaceState(null,"",location.pathname+location.search);
      return;
    }
    if(authError){
      setError(decodeURIComponent(authError));
      history.replaceState(null,"",location.pathname+location.search);
    }
  }

  async function verify(){
    const value=token();
    if(!value){showLogin();return false;}
    try{
      const res=await fetch(API_URL+"/auth/me",{headers:{Authorization:"Bearer "+value},cache:"no-store"});
      const body=await res.json().catch(()=>({}));
      if(!res.ok||!body.ok)throw new Error(body.error||"Sessão inválida.");
      window.COLHERDPAU_AUTH={apiUrl:API_URL,token:value,user:body.user};
      showApp();
      return true;
    }catch{
      sessionStorage.removeItem(TOKEN_KEY);
      showLogin();
      return false;
    }
  }

  if(loginBtn){
    loginBtn.addEventListener("click",()=>{
      const returnTo=location.origin+location.pathname;
      location.href=API_URL+"/auth/login?return_to="+encodeURIComponent(returnTo);
    });
  }

  consumeCallbackToken();
  window.COLHERDPAU_LOGOUT=()=>{
    sessionStorage.removeItem(TOKEN_KEY);
    location.reload();
  };
  window.COLHERDPAU_GET_AUTH=()=>({apiUrl:API_URL,token:token()});
  verify();
})();
