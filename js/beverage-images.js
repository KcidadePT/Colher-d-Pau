(()=>{
  const getData=()=>{
    try{
      const saved=localStorage.getItem("colherdpau_menu_data");
      return saved?JSON.parse(saved):window.MENU_DATA;
    }catch{
      return window.MENU_DATA;
    }
  };

  function openLightbox(src,caption){
    const box=document.getElementById("imageLightbox");
    const image=document.getElementById("lightboxImage");
    const text=document.getElementById("lightboxCaption");
    if(!box||!image) return;
    image.src=src;
    if(text) text.textContent=caption||"";
    box.classList.add("open");
    document.body.classList.add("modal-open");
  }

  function applyBeverageImages(){
    const data=getData();
    const beverages=data?.beverages||[];
    if(!beverages.length) return;

    document.querySelectorAll("#menuContent .dish").forEach(card=>{
      const title=card.querySelector("h3")?.textContent?.trim();
      if(!title) return;
      const item=beverages.find(x=>String(x.name||"").trim()===title);
      if(!item) return;

      const src=item.imageData||item.image;
      if(!src) return;

      const img=card.querySelector("img");
      if(!img) return;

      img.src=src;
      img.alt=title;
      img.classList.add("drink-image","zoomable");
      img.onerror=()=>{
        img.onerror=null;
        img.src="assets/drink-placeholder.svg";
      };
      img.onclick=()=>openLightbox(src,title);
    });
  }

  const menuContent=document.getElementById("menuContent");
  if(menuContent){
    const observer=new MutationObserver(()=>requestAnimationFrame(applyBeverageImages));
    observer.observe(menuContent,{childList:true,subtree:true});
  }

  document.addEventListener("DOMContentLoaded",applyBeverageImages);
  requestAnimationFrame(applyBeverageImages);
})();