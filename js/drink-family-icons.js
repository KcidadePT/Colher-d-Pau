(()=>{
  "use strict";
  const icons={
    wine:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 3h8v3c0 2.8-1.7 5.2-4 6.1V18m0 0v3m-3 0h6"/></svg>`,
    soft:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10 3h4M12 3v3m-3 2h6l-1 11a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2L9 8Z"/></svg>`,
    beer:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 8h8a1 1 0 0 1 1 1v7a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1Z"/><path d="M16 10h1.5A2.5 2.5 0 0 1 20 12.5v1A2.5 2.5 0 0 1 17.5 16H16"/><path d="M8.5 6.5c.3-.9 1.1-1.5 2-1.5.8 0 1.5.4 1.9 1 .4-.6 1.1-1 1.9-1 1.3 0 2.2 1 2.2 2.2 0 .3 0 .5-.1.8"/></svg>`,
    spirits:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 9h10l-1 8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2L7 9Z"/><path d="M6 9h12M9 5h6"/></svg>`,
    hot:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 9h8a1 1 0 0 1 1 1v3.5A4.5 4.5 0 0 1 11.5 18h-1A4.5 4.5 0 0 1 6 13.5V10a1 1 0 0 1 1-1Z"/><path d="M16 10h1a2 2 0 0 1 0 4h-1"/><path d="M9 4c0 1-.8 1.4-.8 2.3S9 7.7 9 8m3-4c0 1-.8 1.4-.8 2.3S12 7.7 12 8"/></svg>`
  };
  function apply(){
    document.querySelectorAll('.drink-family-card[data-family]').forEach(card=>{
      const slot=card.querySelector('.drink-family-icon');
      const family=card.dataset.family;
      const icon=icons[family];
      if(!slot||!icon||slot.dataset.iconApplied===family)return;
      slot.innerHTML=icon;
      slot.dataset.iconApplied=family;
    });
  }
  const target=document.getElementById('drinkFamilyNav');
  if(target)new MutationObserver(apply).observe(target,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',apply);
  apply();
})();
