const categories = ['All gifts','Photo gifts','Accessories','Drinkware','Desk & home'];
const products = [
 ['9','Crystal Crescent Photo Lamp',999,1,'A crystal crescent surrounds a heart-shaped photo in warm light.'],
 ['6','Heart Locket Keyring',249,2,'Two favourite photos tuck inside this little heart.'],
 ['114416','Monogram Gift Set',1299,2,'A coordinated set of everyday accessories with personalised nameplates.'],
 ['3','Illustrated Couple Portrait',699,1,'A favourite moment reimagined as a framed illustration.'],
 ['114506','Birthday Photo Frame',449,1,'A white frame with a birthday message beneath the photo.'],
 ['114500','Envelope Sketch Pendant',399,2,'A tiny envelope opens to reveal a keepsake insert.'],
 ['114515','Personalised Black Bottle',599,3,'A matte black bottle finished with a name in script.'],
 ['2','Doctor’s Desk Organiser',799,4,'A white-coat pen holder paired with a clock and a nameplate.'],
 ['7','Sleepy Panda Night Light',399,4,'A softly glowing panda for a bedside corner.'],
 ['1','Pastel Water Bottle',349,3,'A loop-top bottle in a palette of soft pastels.'],
 ['4','Animated Couple Portrait',699,1,'An illustrated couple portrait in a dark frame.'],
 ['5','Little Panda Light',299,4,'A playful panda-shaped light with a hanging loop.'],
 ['8','Personalised Photo Bottle',499,3,'A 750 ml bottle featuring a name and photo print.'],
 ['10','Golden Crescent Keepsake',999,1,'A golden crescent frames a hanging heart-shaped picture.'],
 ['114425','Wooden Savings Box',499,4,'A wooden savings box with a printed progress tracker.'],
 ['114434','Engraved Name Keyring',199,2,'A dark tag with a contrasting engraved name.'],
 ['114445','Savings Challenge Box',549,4,'A wooden box with a grid for tracking a savings challenge.']
].map(([id,name,price,group,description])=>({id,name,price,group,description}));
const $ = id => document.getElementById(id);
const modal = $('modal'), content = $('content');
const money = value => '₹'+value.toLocaleString('en-IN');
const picture = p => 'assets/'+p.id+'.webp';
const find = id => products.find(p=>p.id===id);
let active = categories[0], cart = {}, noticeTimer;
try {
 const saved = JSON.parse(localStorage.getItem('amazing-gifts-bag') || '{}');
 for(const [id,n] of Object.entries(saved)) if(find(id)&&Number.isSafeInteger(n)&&n>0&&n<=99) cart[id]=n;
} catch {}
function persist(){
 try {localStorage.setItem('amazing-gifts-bag',JSON.stringify(cart));} catch {}
 $('count').textContent=Object.values(cart).reduce((a,b)=>a+b,0);
}
function total(){return Object.entries(cart).reduce((sum,[id,n])=>sum+find(id).price*n,0)}
function render(){
 $('filters').innerHTML=categories.map(c=>'<button data-category="'+c+'" aria-pressed="'+(c===active)+'">'+c+'</button>').join('');
 const query=$('search').value.trim().toLowerCase();
 const visible=products.filter(p=>(active===categories[0]||categories[p.group]===active)&&p.name.toLowerCase().includes(query));
 $('results').textContent=visible.length+' gifts';
 const sort=$('sort').value;
 if(sort!=='featured') visible.sort((a,b)=>sort==='asc'?a.price-b.price:b.price-a.price);
 $('grid').innerHTML=visible.map(productCard).join('') || '<p>No gifts found. Try another search or category.</p>';
}
function show(title,html){
 content.innerHTML='<h2 id="dialogTitle" tabindex="-1">'+title+'</h2>'+html;
 if(!modal.open) modal.showModal();
 $('dialogTitle').focus();
}
function showBag(){
 const rows=Object.entries(cart).map(([id,n])=>{
 const p=find(id);
 return `<div class="line"><img src="${picture(p)}" alt=""><div><strong>${p.name}</strong><div>${money(n*p.price)}</div><div class="qty"><button data-change="-1" data-id="${id}" aria-label="Decrease ${p.name} quantity">−</button>${n}<button data-change="1" data-id="${id}" aria-label="Increase ${p.name} quantity" ${n>=99?'disabled':''}>+</button></div></div></div>`;
 });
 show('Your bag',rows.length?rows.join('')+'<div class="total"><b>Subtotal</b><b>'+money(total())+'</b></div><button class="primary" id="checkout">Demo checkout →</button>':'<p>Your bag is empty.</p><button class="primary" data-close>Explore the collection</button>');
}
function toast(message){clearTimeout(noticeTimer);$('toast').textContent=message;noticeTimer=setTimeout(()=>$('toast').textContent='',1800)}
document.addEventListener('click',event=>{
 const b=event.target.closest('button,a'); if(!b)return;
 const d=b.dataset;
 if(d.category){active=d.category;render();if(b.tagName==='BUTTON') $('filters').querySelector('[aria-pressed=true]').focus();}
 else if(d.view){const p=find(d.view);show(p.name,`<img class="detail" src="${picture(p)}" alt="${p.name}"><p>${p.description}</p><b>${money(p.price)}</b><button class="primary" data-add="${p.id}">Add to bag</button>`);}
 else if(d.add){if((cart[d.add]||0)>=99){if(modal.open)modal.close();toast('Maximum quantity is 99');return;}cart[d.add]=(cart[d.add]||0)+1;persist();if(modal.open)showBag();else toast('Added to your bag');}
 else if(b.id==='bag')showBag();
 else if(d.change){cart[d.id]+=Number(d.change);if(!cart[d.id])delete cart[d.id];persist();showBag();}
 else if(b.id==='checkout'&&total())show('Demo checkout','<p>Test the payment experience using the demo wallet. No money will be charged.</p><div class="line"><strong>Demo wallet</strong></div><div class="total"><b>Order total</b><b>'+money(total())+'</b></div><button class="primary" id="pay">Pay '+money(total())+' · Demo</button><button id="back">← Back to bag</button>');
 else if(b.id==='back')showBag();
 else if(b.id==='pay'&&total()){const amount=money(total());cart={};persist();show('Payment successful!','<div class="mark">✓</div><p>Your demo payment of <b>'+amount+'</b> was successful. No money was charged.</p><button class="primary" data-close>Continue shopping</button>');}
 else if(b.classList.contains('close')||'close' in d)modal.close();
});
$('sort').addEventListener('change',render);
persist(); render();

function productCard(p){return `<article class="product"><button class="photo" data-view="${p.id}" aria-label="View ${p.name}"><img loading="lazy" src="${picture(p)}" alt="${p.name}"></button><small>${categories[p.group]}</small><h3>${p.name}</h3><div class="meta"><strong>${money(p.price)}</strong><button class="add" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div></article>`;}
$('featured').innerHTML=products.slice(0,4).map(productCard).join('');

const scenes = ['9','114416','114515','7','3','6','2','114500'].map(find);
let sceneIndex = 0;
function showScene(index) {
 sceneIndex = (index + scenes.length) % scenes.length;
 const p = scenes[sceneIndex];
 $('heroNumber').textContent = String(sceneIndex+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');
 $('heroCategory').textContent = categories[p.group].toUpperCase();
 $('heroName').textContent = p.name;
 $('heroDescription').textContent = p.description;
 $('heroPrice').textContent = money(p.price);
 $('heroWord').textContent = categories[p.group].toUpperCase();
 const old = $('heroImage');
 const img = old.cloneNode();
 img.src = picture(p);
 img.alt = p.name;
 old.replaceWith(img);
 $('heroAdd').dataset.add = p.id;
 $('heroView').dataset.view = p.id;
 $('dots').innerHTML = scenes.map((item,i)=>'<button data-scene="'+i+'" aria-label="Show '+item.name+'" aria-current="'+(i===sceneIndex)+'"></button>').join('');
 document.querySelectorAll('.showroom-tabs button').forEach(button=>button.setAttribute('aria-pressed',Number(button.dataset.scene)===sceneIndex));
}
$('prev').addEventListener('click',()=>showScene(sceneIndex-1));
$('next').addEventListener('click',()=>showScene(sceneIndex+1));
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-scene]');
 if(button)showScene(Number(button.dataset.scene));
});
let pointerStart = null;
const stage = $('stage');
stage.addEventListener('pointerdown',event=>{pointerStart=event.clientX;stage.setPointerCapture(event.pointerId)});
stage.addEventListener('pointerup',event=>{
 if(pointerStart!==null && Math.abs(event.clientX-pointerStart)>35) showScene(sceneIndex+(event.clientX<pointerStart?1:-1));
 pointerStart=null;
});
stage.addEventListener('pointercancel',()=>pointerStart=null);
document.querySelector('.showroom').addEventListener('keydown',event=>{
 if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showScene(sceneIndex+(event.key==='ArrowRight'?1:-1))}
});
$('searchToggle').addEventListener('click',()=>{
 $('searchForm').hidden=!$('searchForm').hidden;
 if(!$('searchForm').hidden)$('search').focus();
});
$('searchForm').addEventListener('submit',event=>{
 event.preventDefault();active=categories[0];render();
 $('collection').scrollIntoView({behavior:'smooth'});
});
$('search').addEventListener('input',render);
showScene(0);
