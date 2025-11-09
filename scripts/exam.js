// ===============================
// AJ FASHION GALAXY MAIN SCRIPT
// ===============================

let products = JSON.parse(localStorage.getItem('aj_products') || '[]');
let cart = JSON.parse(localStorage.getItem('aj_cart') || '[]');

const modals = document.getElementById('modals');
const cartDrawer = document.getElementById('cartDrawer');
const productGrid = document.getElementById('productGrid');

// --- ADMIN PROTECTION FOR SELL PAGE ---
const sellBtn = document.getElementById('sellBtn');
if (sellBtn) {
  sellBtn.addEventListener('click', e => {
    e.preventDefault();
    const username = prompt('Enter admin username:');
    const password = prompt('Enter admin password:');
    if (username === 'admin' && password === '12345') {
      localStorage.setItem('isAdmin', 'true');
      window.location.href = 'sell.html';
    } else if (username !== null && password !== null) {
      alert('Access denied!');
    }
  });
}

// --- DEFAULT DEMO PRODUCTS ---
if (products.length === 0) {
  products = [
    { id: 'p1', title: 'Women’s Blouse', category: 'Women', price: 85, img: 'images/blouse.jpg', desc: 'Lightweight cotton blouse, perfect for everyday style.' },
    { id: 'p2', title: 'Men’s Sneakers', category: 'Men', price: 240, img: 'images/sneakers.jpg', desc: 'Stylish sneakers for daily comfort and class.' },
    { id: 'p3', title: 'Kids Hoodie', category: 'Kids', price: 130, img: 'images/hoodie.jpg', desc: 'Soft, warm, and cozy hoodie for kids — great for all seasons.' }
  ];
  localStorage.setItem('aj_products', JSON.stringify(products));
}

// --- SAVE FUNCTIONS ---
function saveProducts() {
  localStorage.setItem('aj_products', JSON.stringify(products));
}
function saveCart() {
  localStorage.setItem('aj_cart', JSON.stringify(cart));
}

// --- RENDER PRODUCTS ---
function renderProducts(list = products) {
  if (!productGrid) return;
  productGrid.innerHTML = list.map(p => `
    <div class="card">
      <div class="media"><img src="${p.img}" alt="${p.title}"></div>
      <div class="body">
        <div class="meta">
          <div class="title">${p.title}</div>
          <div class="price">GHS ${p.price.toFixed(2)}</div>
        </div>
        <div class="desc">${p.desc}</div>
        <div class="actions">
          <button class="small" onclick="addToCart('${p.id}')">Add to Cart</button>
          <button class="small" onclick="viewProduct('${p.id}')">View</button>
        </div>
      </div>
    </div>
  `).join('');
  const rc = document.getElementById('resultCount');
  if (rc) rc.textContent = `${list.length} results`;
}

// --- FILTERING & SORTING ---
let currentCategory = 'All';
let currentQuery = '';

function filterAndRender(category = currentCategory, query = currentQuery) {
  currentCategory = category;
  currentQuery = query;

  let filtered = [...products];
  if (category !== 'All') filtered = filtered.filter(p => p.category === category);
  if (query) filtered = filtered.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));

  const sortValue = document.getElementById('sortBy')?.value || 'popular';
  filtered = sortProducts(filtered, sortValue);

  renderProducts(filtered);
}

function sortProducts(list, value) {
  switch (value) {
    case 'price_asc': return list.sort((a, b) => a.price - b.price);
    case 'price_desc': return list.sort((a, b) => b.price - a.price);
    default: return list;
  }
}
function applySort() {
  filterAndRender(currentCategory, currentQuery);
}

// --- SEARCH ---
document.getElementById('search')?.addEventListener('input', e => {
  currentQuery = e.target.value.trim();
  filterAndRender(currentCategory, currentQuery);
});

// --- CATEGORY BUTTONS ---
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterAndRender(btn.dataset.cat, currentQuery);
  });
});

// --- CART ---
function addToCart(id) {
  const item = products.find(p => p.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  saveCart();
  renderCart();
}
function renderCart() {
  const container = document.getElementById('cartItems');
  const subtotal = document.getElementById('subtotal');
  if (!container || !subtotal) return;
  document.getElementById('cartNum').textContent = cart.reduce((s, i) => s + i.qty, 0);
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3>Your Cart</h3>
      <button onclick="cartDrawer.classList.remove('open')" style="background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>
    </div>
    ${cart.map(i => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <img src="${i.img}" style="width:55px;height:55px;object-fit:cover;border-radius:6px;">
        <div style="flex:1">
          <div>${i.title}</div>
          <div style="font-size:13px;color:gray">GHS ${i.price.toFixed(2)}</div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:4px">
            <button class="small" onclick="decrease('${i.id}')">-</button>
            <span>${i.qty}</span>
            <button class="small" onclick="increase('${i.id}')">+</button>
          </div>
        </div>
        <button class="small" onclick="removeFromCart('${i.id}')">x</button>
      </div>
    `).join('')}
  `;
  subtotal.textContent = cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);
}
function removeFromCart(id){cart=cart.filter(c=>c.id!==id);saveCart();renderCart();}
function increase(id){const c=cart.find(c=>c.id===id);if(c)c.qty++;saveCart();renderCart();}
function decrease(id){const c=cart.find(c=>c.id===id);if(c&&c.qty>1)c.qty--;saveCart();renderCart();}

// --- VIEW PRODUCT ---
function viewProduct(id){
  const p=products.find(x=>x.id===id);
  if(!p)return;
  modals.innerHTML=`
  <div class="modal-backdrop" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <button onclick="closeModal()" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:22px;">&times;</button>
      <img src="${p.img}" style="width:100%;max-height:450px;object-fit:contain;border-radius:8px;">
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div style="font-weight:bold">GHS ${p.price.toFixed(2)}</div>
      <button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>
    </div>
  </div>`;
}
function closeModal(e){if(e&&e.target!==e.currentTarget)return;modals.innerHTML='';}

// --- EVENT HOOKS ---
document.getElementById('openCart')?.addEventListener('click',()=>cartDrawer.classList.add('open'));
document.getElementById('closeCart')?.addEventListener('click',()=>cartDrawer.classList.remove('open'));

// --- INITIAL LOAD ---
renderProducts(products);
renderCart();