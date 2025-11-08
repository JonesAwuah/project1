// ===============================
// AJ FASHION GALAXY MAIN SCRIPT
// ===============================

// --- GLOBAL STATE ---
let products = JSON.parse(localStorage.getItem('aj_products') || '[]');
let cart = JSON.parse(localStorage.getItem('aj_cart') || '[]');
const modals = document.getElementById('modals');
const cartDrawer = document.getElementById('cartDrawer');
const productGrid = document.getElementById('productGrid');

// --- LOAD DEFAULT DEMO PRODUCTS ---
if (products.length === 0) {
  products = [
    {
      id: 'p1',
      title: 'Classic White T-Shirt',
      category: 'Women',
      price: 85,
      img: 'images/tshirt.jpeg',
      desc: 'Soft cotton premium T-shirt, perfect for daily wear.'
    },
    {
      id: 'p2',
      title: 'Men’s Sneakers',
      category: 'Men',
      price: 240,
      img: 'https://images.unsplash.com/photo-1589187155478-1445c4f06d8f?q=80&w=800',
      desc: 'Comfortable sneakers for everyday wear.'
    },
    {
      id: 'p3',
      title: 'Kids Hoodie',
      category: 'Kids',
      price: 130,
      img: 'https://images.unsplash.com/photo-1606813909180-79c3e962654f?q=80&w=800',
      desc: 'Cozy hoodie for kids, great for all seasons.'
    }
  ];
  saveProducts();
}

// --- SAVE / LOAD HELPERS ---
function saveProducts() {
  localStorage.setItem('aj_products', JSON.stringify(products));
}
function saveCart() {
  localStorage.setItem('aj_cart', JSON.stringify(cart));
}

// --- RENDER PRODUCTS ---
function renderProducts(list = products) {
  productGrid.innerHTML = list.map(p => `
    <div class="card">
      <div class="media"><img src="${p.img}" alt="${escapeHtml(p.title)}"></div>
      <div class="body">
        <div class="meta">
          <div class="title">${escapeHtml(p.title)}</div>
          <div class="price">GHS ${p.price.toFixed(2)}</div>
        </div>
        <div class="desc">${escapeHtml(p.desc)}</div>
        <div class="actions">
          <button class="small" onclick="addToCart('${p.id}')">Add to Cart</button>
          <button class="small" onclick="viewProduct('${p.id}')">View</button>
        </div>
      </div>
    </div>
  `).join('');
  document.getElementById('resultCount').textContent = `${list.length} results`;
}

// --- FILTER / SEARCH ---
function filterAndRender(category = null, query = '') {
  let filtered = [...products];
  if (category && category !== 'All') filtered = filtered.filter(p => p.category === category);
  if (query) filtered = filtered.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
  renderProducts(filtered);
}

// --- CART FUNCTIONS ---
function addToCart(id) {
  const item = products.find(p => p.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
}

function increase(id) {
  const c = cart.find(c => c.id === id);
  if (c) c.qty++;
  saveCart();
  renderCart();
}

function decrease(id) {
  const c = cart.find(c => c.id === id);
  if (c && c.qty > 1) c.qty--;
  saveCart();
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const subtotal = document.getElementById('subtotal');
  document.getElementById('cartNum').textContent = cart.reduce((s, i) => s + i.qty, 0);
  container.innerHTML = cart.map(i => `
    <div class="cart-line">
      <img src="${i.img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">
      <div style="flex:1">
        <div>${escapeHtml(i.title)}</div>
        <div style="font-size:13px;color:var(--muted)">GHS ${i.price.toFixed(2)}</div>
        <div style="display:flex;gap:6px;align-items:center;margin-top:4px">
          <button class="small" onclick="decrease('${i.id}')">-</button>
          <span>${i.qty}</span>
          <button class="small" onclick="increase('${i.id}')">+</button>
        </div>
      </div>
      <button class="small" onclick="removeFromCart('${i.id}')">x</button>
    </div>
  `).join('');
  subtotal.textContent = cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);
}

// --- PRODUCT VIEW ---
function viewProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  modals.innerHTML = `
  <div class="modal-backdrop" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="media"><img src="${p.img}" style="width:100%;height:100%;object-fit:cover"></div>
      <div class="content">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.desc)}</p>
        <div style="font-weight:700;margin:8px 0">GHS ${p.price.toFixed(2)}</div>
        <button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    </div>
  </div>`;
}

// --- LOGIN MODAL ---
function showLoginModal() {
  modals.innerHTML = `
  <div class="modal-backdrop" onclick="closeModal(event)">
    <div class="modal" style="max-width:420px" onclick="event.stopPropagation()">
      <div style="padding:18px">
        <h3>Login / Register</h3>
        <label>Email</label><input id="lg_email" type="text" />
        <label>Password</label><input id="lg_pass" type="password" />
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn" onclick="alert('Demo: login simulated')">Login</button>
          <button class="btn alt" onclick="alert('Demo: register simulated')">Register</button>
        </div>
      </div>
    </div>
  </div>`;
}

// --- CHECKOUT MODAL ---
function showCheckoutModal() {
  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }
  modals.innerHTML = `
  <div class="modal-backdrop" onclick="closeModal(event)">
    <div class="modal" style="max-width:640px" onclick="event.stopPropagation()">
      <div style="padding:18px">
        <h3>Checkout</h3>
        <label>Full name</label><input id="co_name" type="text" />
        <label>Phone</label><input id="co_phone" type="text" />
        <label>Delivery address</label><input id="co_addr" type="text" />
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn" id="placeOrder">Place order</button>
          <button class="btn alt" onclick="closeModal()">Cancel</button>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('placeOrder').addEventListener('click', () => {
    const name = document.getElementById('co_name').value.trim();
    if (!name) {
      alert('Please enter name');
      return;
    }
    const order = {
      id: 'ORD' + Date.now(),
      items: cart.slice(),
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
      name
    };
    cart = [];
    saveCart();
    renderCart();
    closeModal();
    cartDrawer.classList.remove('open');
    alert('Order placed — ' + order.id + '\nThank you ' + order.name + '!');
  });
}

// --- GENERAL UTILITIES ---
function escapeHtml(s) {
  if (!s) return '';
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function closeModal(e) {
  if (e && e.target !== e.currentTarget) return;
  modals.innerHTML = '';
}

// --- EVENT LISTENERS ---
document.getElementById('loginBtn').addEventListener('click', showLoginModal);
document.getElementById('checkoutBtn').addEventListener('click', showCheckoutModal);
document.getElementById('openCart').addEventListener('click', () => cartDrawer.classList.add('open'));
document.getElementById('closeCart').addEventListener('click', () => cartDrawer.classList.remove('open'));

document.getElementById('search').addEventListener('input', e => {
  filterAndRender(null, e.target.value);
});

document.querySelectorAll('.chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    filterAndRender(cat);
  });
});

// --- INIT ---
renderProducts(products);
renderCart();

// --- GLOBAL EXPORTS (for inline onclick) ---
window.removeFromCart = removeFromCart;
window.increase = increase;
window.decrease = decrease;
window.addToCart = addToCart;
window.viewProduct = viewProduct;
window.closeModal = closeModal;
