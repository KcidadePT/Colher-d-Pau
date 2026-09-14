(()=>{
  "use strict";

  const FOOD_FALLBACK = "assets/dish-placeholder.svg";

  const icons = {
    fish:'<g transform="translate(160 120) scale(.82) translate(-160 -120)"><path d="M111 120c21-24 45-36 72-36 24 0 45 12 64 36-19 24-40 36-64 36-27 0-51-12-72-36Z"/><path d="M111 120 82 98v44l29-22Z"/><circle cx="203" cy="112" r="5" fill="#9a7440" stroke="none"/></g>',
    meat:'<g transform="translate(160 120) scale(.86) translate(-160 -120)"><path d="M103 126c0-23 18-42 43-47 24-5 48 5 62 23 13 17 15 38 5 55-10 18-31 29-56 29-32 0-54-17-54-60Z"/><path d="M121 124c7-17 22-28 40-28 16 0 31 8 39 21 7 12 6 26-2 37-9 11-23 18-40 18-24 0-42-15-42-36 0-4 2-8 5-12Z"/><ellipse cx="185" cy="116" rx="15" ry="13"/><path d="M132 138l14-15M151 145l15-17M171 149l13-15"/></g>',
    veggie:'<g transform="translate(160 120) scale(.9) translate(-160 -120)"><path d="M214 70c-52 2-92 27-101 69-6 27 10 48 36 48 47 0 68-52 65-117Z"/><path d="M132 166c17-20 36-41 57-66"/><path d="M151 144c0-11 3-22 9-34"/><path d="M171 125c10 1 19 4 28 9"/></g>',
    dessert:'<g transform="translate(80 61) scale(.18)" fill="#825128" stroke="none" fill-rule="evenodd"><path d="M532 135L525 135L524 136L523 136L522 137L521 137L516 142L516 143L515 144L515 145L514 146L514 147L513 148L513 156L515 158L516 158L517 159L519 159L520 158L521 158L524 155L524 152L526 150L526 149L527 148L528 148L529 147L530 147L531 146L532 146L535 143L535 139L534 138L534 137Z"/><path d="M705 33L664 38L626 55L598 84L582 124L549 111L526 113L507 122L489 144L486 179L466 194L207 332L200 343L200 399L114 424L56 455L40 472L33 488L33 505L41 522L76 551L166 585L273 605L404 615L533 613L656 599L756 575L829 540L854 508L851 477L831 454L806 438L717 407L717 290L713 275L701 256L667 229L665 209L655 190L631 170L602 160L597 141L626 136L651 125L677 104L699 67ZM44 491L54 473L83 451L148 425L199 413L200 535L204 538L710 484L717 479L718 420L770 435L815 457L840 481L844 501L836 517L808 540L772 557L714 575L639 590L575 598L421 604L278 594L158 571L111 555L72 535L49 513ZM705 393L704 472L237 523L211 524L212 447ZM705 301L704 380L224 434L211 433L212 354L699 300ZM704 285L703 288L221 340L244 325L452 215L455 216L455 230L462 247L475 260L492 269L517 275L540 276L580 266L597 255L611 238L617 222L617 209L614 206L607 207L600 233L586 248L571 257L542 264L512 262L485 252L470 237L467 218L475 201L488 191L492 191L507 207L526 216L548 218L565 214L587 199L597 183L600 172L632 185L648 201L654 215L655 229L651 243L640 257L628 265L628 271L635 274L643 270L666 243L690 262ZM532 124L536 124L537 123L549 123L550 124L554 124L555 125L557 125L558 126L560 126L561 127L562 127L563 128L564 128L565 129L568 130L570 132L571 132L581 142L581 143L583 145L583 146L586 151L586 153L587 154L587 158L588 159L588 170L587 171L587 175L586 176L586 178L585 179L585 180L584 181L583 184L581 186L581 187L572 196L571 196L568 199L567 199L566 200L565 200L560 203L557 203L556 204L554 204L553 205L548 205L547 206L539 206L538 205L532 205L531 204L528 204L527 203L525 203L524 202L523 202L522 201L521 201L520 200L517 199L515 197L514 197L504 187L504 186L502 184L502 183L500 180L500 178L498 175L498 171L497 170L497 159L498 158L498 155L499 154L499 152L500 151L500 150L501 149L501 148L502 147L503 144L505 142L505 141L513 133L514 133L516 131L517 131L519 129L520 129L523 127L525 127L526 126L528 126L529 125L531 125ZM692 47L692 50L691 51L691 53L690 54L690 56L688 59L688 61L687 62L687 64L686 65L686 66L685 67L685 68L684 69L684 70L683 71L683 72L682 73L682 74L681 75L681 76L680 77L679 80L675 85L674 88L669 93L669 94L657 106L656 106L653 109L652 109L647 113L646 113L645 114L642 115L640 117L639 117L634 120L632 120L629 122L627 122L626 123L624 123L623 124L620 124L619 125L617 125L616 126L613 126L612 127L609 127L608 128L604 128L603 129L596 129L595 128L595 125L596 124L596 121L597 120L597 117L598 116L598 114L599 113L599 111L600 110L600 108L602 105L602 103L603 102L603 101L604 100L604 99L605 98L606 95L608 93L609 90L611 88L611 87L614 84L614 83L627 70L628 70L631 67L632 67L634 65L637 64L639 62L640 62L641 61L642 61L643 60L644 60L645 59L646 59L651 56L653 56L656 54L658 54L659 53L661 53L662 52L664 52L665 51L667 51L668 50L670 50L671 49L675 49L676 48L679 48L680 47L684 47L685 46L691 46Z"/></g>',
    starters:'<g transform="translate(160 120) scale(.84) translate(-160 -120)"><ellipse cx="160" cy="165" rx="68" ry="18"/><path d="M111 149h33v16h-33Z"/><path d="M116 149v-20c0-9 6-15 12-15s12 6 12 15v20"/><circle cx="128" cy="108" r="8"/><path d="M128 100V82"/><path d="M147 149h31v16h-31Z"/><path d="M152 149v-18c0-8 5-13 11-13s11 5 11 13v18"/><path d="M159 115c7-13 18-18 30-17-2 13-10 22-24 27"/><path d="M187 149h28v16h-28Z"/><rect x="190" y="123" width="22" height="22" rx="2"/><path d="M201 123V92"/></g>',
    couvert:'<path d="M96 156h128M111 156c1-34 22-58 51-58 28 0 49 24 50 58"/><path d="M126 111c7-27 27-45 57-49 17 18 22 37 19 56M143 83l-11-22m35 13-2-28m24 36 12-20"/>',
    generic:'<circle cx="160" cy="119" r="61"/><path d="M120 135c13-17 26-25 40-25s27 8 40 25M132 91h56"/>'
  };

  const byCategory = {
    fish:"fish",
    meat:"meat",
    vegetarian:"veggie",
    desserts:"dessert",
    starters:"starters",
    couvert:"couvert"
  };

  function placeholderSvg(kind){
    const icon = icons[kind] || icons.generic;
    const circleRadius = kind === "dessert" ? 86 : 78;
    const circle = `<circle cx="160" cy="120" r="${circleRadius}" fill="#fffaf4" stroke="#d9c7ab" stroke-width="2"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" rx="24" fill="#f5eee4"/>${circle}<g fill="none" stroke="#9a7440" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${icon}</g></svg>`;
  }

  function asDataUri(svg){
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  const cache = new Map();
  function getPlaceholder(kind){
    if(!cache.has(kind)) cache.set(kind, asDataUri(placeholderSvg(kind)));
    return cache.get(kind);
  }

  function categoryFor(img){
    const section = img.closest(".section[data-category]");
    if(section) return section.dataset.category || "";

    const chef = img.closest(".chef-card");
    if(chef){
      const t=(chef.querySelector(".chef-type")?.textContent||"").toLowerCase();
      if(/peixe|fish|poisson|pescado|fisch|pesce|рыб/.test(t)) return "fish";
      if(/carne|meat|viande|fleisch|мяс/.test(t)) return "meat";
      if(/entrada|starter|entrée|vorspeise|antipasto|закуск/.test(t)) return "starters";
    }
    return "";
  }

  function isActualFoodFallback(img){
    const src=(img.getAttribute("src")||"").split("?")[0].split("#")[0];
    return src.endsWith(FOOD_FALLBACK);
  }

  function upgrade(img){
    if(!(img instanceof HTMLImageElement) || !isActualFoodFallback(img)) return;
    const kind=byCategory[categoryFor(img)]||"generic";
    const uri=getPlaceholder(kind);
    img.src=uri;
    img.dataset.full=uri;
    img.dataset.smartPlaceholder=kind;
    img.classList.add("smart-dish-placeholder");
  }

  function scan(root=document){
    root.querySelectorAll?.("img").forEach(upgrade);
  }

  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      if(mutation.type==="attributes"){
        upgrade(mutation.target);
        continue;
      }
      mutation.addedNodes.forEach(node=>{
        if(node.nodeType!==1) return;
        if(node.matches?.("img")) upgrade(node);
        scan(node);
      });
    }
  });

  function start(){
    scan();
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["src"]});
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();