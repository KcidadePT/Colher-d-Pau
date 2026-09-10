(()=>{
  "use strict";

  function applyDishIds(){
    if(document.body.dataset.menuView!=="food"){
      document.querySelectorAll(".dish-id").forEach(el=>el.remove());
      return;
    }

    const data=window.MENU_DATA;
    if(!data||!Array.isArray(data.food))return;

    document.querySelectorAll("#menuContent .section[data-category]").forEach(section=>{
      const category=section.dataset.category;
      const items=data.food.filter(item=>item.available!==false&&item.category===category);
      const dishes=section.querySelectorAll(".dish");

      dishes.forEach((dish,index)=>{
        const item=items[index];
        const title=dish.querySelector("h3");
        if(!item||!title)return;

        let badge=dish.querySelector(".dish-id");
        if(!badge){
          badge=document.createElement("span");
          badge.className="dish-id";
          title.parentNode.insertBefore(badge,title);
        }
        const code=String(item.code??item.id??"").trim();
        badge.textContent=code;
        badge.hidden=!code;
      });
    });
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      applyDishIds();
    });
  }

  const menu=document.getElementById("menuContent");
  if(menu)new MutationObserver(schedule).observe(menu,{childList:true,subtree:true});

  document.getElementById("foodBtn")?.addEventListener("click",schedule);
  document.getElementById("drinkBtn")?.addEventListener("click",schedule);
  window.addEventListener("pageshow",schedule);
  schedule();
})();
