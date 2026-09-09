(()=>{
  const bar=document.getElementById('floatingCategoryBar');
  const source=document.getElementById('categoryStrip');
  const area=document.getElementById('menuArea');
  if(!bar||!source||!area)return;

  function syncButtons(){
    const sourceButtons=[...source.querySelectorAll('.cat-btn')];
    bar.innerHTML=sourceButtons.map(btn=>`<button type="button" class="floating-cat-btn ${btn.classList.contains('active')?'active':''}" data-c="${btn.dataset.c||''}">${btn.textContent}</button>`).join('');
    bar.querySelectorAll('.floating-cat-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const target=source.querySelector(`.cat-btn[data-c="${CSS.escape(btn.dataset.c)}"]`);
        if(target)target.click();
        setTimeout(syncButtons,0);
      });
    });
  }

  function updateVisibility(){
    const threshold=area.getBoundingClientRect().top+window.scrollY;
    const shouldShow=window.scrollY>=threshold-8;
    bar.classList.toggle('is-visible',shouldShow);
  }

  const observer=new MutationObserver(()=>{syncButtons();updateVisibility()});
  observer.observe(source,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

  window.addEventListener('scroll',updateVisibility,{passive:true});
  window.addEventListener('resize',updateVisibility);
  window.addEventListener('focus',()=>{syncButtons();updateVisibility()});

  syncButtons();
  updateVisibility();
})();