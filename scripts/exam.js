// ===============================
// AJ FASHION GALAXY MAIN SCRIPT
// ===============================

// --- GLOBAL STATE ---
let products = JSON.parse(localStorage.getItem('aj_products') || '[]');
let cart = JSON.parse(localStorage.getItem('aj_cart') || '[]');
const modals = document.getElementById('modals');
const cartDrawer = document.getElementById('cartDrawer');
const productGrid = document.getElementById('productGrid');

// --- SELL ADMIN LOGIN MODAL ---
document.getElementById('sellBtn')?.addEventListener('click', function (event) {
  event.preventDefault();

  const username = prompt('Enter admin username:');
  const password = prompt('Enter admin password:');

  const adminUser = 'admin';
  const adminPass = '12345';

  if (username === adminUser && password === adminPass) {
    localStorage.setItem('isAdmin', 'true');
    window.location.href = 'sell.html';
  } else if (username === null || password === null) {
    return; // user cancelled
  } else {
    alert('Access denied! Invalid username or password.');
  }
});

// --- LOAD DEFAULT DEMO PRODUCTS ---
if (products.length === 0) {
  products = [
    {
      id: 'p1',
      title: 'Women’s Blouse',
      category: 'Clothing',
      price: 85,
      img: 'images/blouse.jpg',
      desc: 'Lightweight cotton blouse, perfect for everyday style.'
    },
    {
      id: 'p2',
      title: 'Men’s Sneakers',
      category: 'Shoes',
      price: 240,
      img: 'images/sneakers.jpg',
      desc: 'Easy-going, stylish sneakers perfect for daily wear with ultimate comfort.'
    },
    {
      id: 'p3',
      title: 'Kids Hoodie',
      category: 'Clothing',
      price: 130,
      img: 'images/hoodie.jpg',
      desc: 'Kids’ hoodie, soft, warm and cozy, great for all seasons.'
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
  if (!productGrid) return;
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
  document.getElementById('resultCount')?.textContent = `${list.length} results`;
}

// --- CATEGORY + SEARCH ---
let currentCategory = 'All';
let currentQuery = '';

function filterAndRender(category = currentCategory, query = currentQuery) {
  currentCategory = category;
  currentQuery = query;

  let filtered = [...products];
  if (category && category !== 'All') filtered = filtered.filter(p => p.category === category);
  if (query) filtered = filtered.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));

  const sortValue = document.getElementById('sortBy')?.value || 'popular';
  filtered = sortProducts(filtered, sortValue);

  renderProducts(filtered);
}

function sortProducts(list, sortValue) {
  switch (sortValue) {
    case 'price_asc': return list.sort((a, b) => a.price - b.price);
    case 'price_desc': return list.sort((a, b) => b.price - a.price);
    default: return list;
  }
}

function applySort() {
  filterAndRender(currentCategory, currentQuery);
}

document.getElementById('search')?.addEventListener('input', e => {
  currentQuery = e.target.value.trim();
  filterAndRender(currentCategory, currentQuery);
});

document.querySelectorAll('.filter-btn')?.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterAndRender(btn.dataset.cat, currentQuery);
  });
});

// ===============================
// SELL PAGE LOGIC
// ===============================
const authArea = document.getElementById('authArea');
const sellForm = document.getElementById('sellForm');
const yourListings = document.getElementById('yourListings');

if (sellForm) {
  document.getElementById('saveProduct').addEventListener('click', () => {
    const title = document.getElementById('p_title').value.trim();
    const category = document.getElementById('p_category').value;
    const price = parseFloat(document.getElementById('p_price').value);
    const img = document.getElementById('p_img').value.trim();
    const desc = document.getElementById('p_desc').value.trim();

    if (!title || !price || !img || !desc) {
      alert('Please fill all fields.');
      return;
    }

    const newProduct = {
      id: 'p' + Date.now(),
      title,
      category,
      price,
      img,
      desc
    };

    products.push(newProduct);
    saveProducts();

    alert('Product added successfully!');
    clearForm();
    loadListings();
  });

  document.getElementById('cancelProduct').addEventListener('click', clearForm);

  function clearForm() {
    document.getElementById('p_title').value = '';
    document.getElementById('p_price').value = '';
    document.getElementById('p_img').value = '';
    document.getElementById('p_desc').value = '';
  }

  function loadListings() {
    yourListings.innerHTML = '';
    if (products.length === 0) {
      yourListings.innerHTML = '<p style="color:var(--muted)">No listings yet.</p>';
      return;
    }

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.img}" alt="${p.title}" style="width:100%;height:160px;object-fit:cover;border-radius:8px">
        <h4>${escapeHtml(p.title)}</h4>
        <div style="font-size:14px;color:var(--muted)">${escapeHtml(p.category)}</div>
        <div style="font-weight:bold;margin-top:4px">GHS ${p.price}</div>
        <p style="font-size:13px;color:var(--muted)">${escapeHtml(p.desc)}</p>
      `;
      yourListings.appendChild(card);
    });
  }

  window.onload = function () {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      authArea.style.display = 'none';
      sellForm.style.display = 'block';
      loadListings();
    } else {
      alert('Access restricted — please log in as admin first.');
      window.location.href = 'index.html';
    }
  };
}

// ===============================
// CART + CHECKOUT
// ===============================
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
  if (!container) return;
  document.getElementById('cartNum').textContent = cart.reduce((s, i) => s + i.qty, 0);
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3>Your Cart</h3>
      <button onclick="cartDrawer.classList.remove('open')" style="background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>
    </div>
    ${cart.map(i => `
      <div class="cart-line" style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <img src="${i.img}" style="width:55px;height:55px;object-fit:cover;border-radius:6px;">
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
    `).join('')}
  `;
  subtotal.textContent = cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);
}

// ===============================
// MODALS
// ===============================
function viewProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  modals.innerHTML = `
  <div class="modal-backdrop" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:700px;position:relative;">
      <button onclick="closeModal()" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>
      <div class="media" style="text-align:center;margin-bottom:20px;">
        <img src="${p.img}" style="width:100%;max-height:500px;object-fit:contain;border-radius:10px;">
      </div>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.desc)}</p>
      <div style="font-weight:bold;margin:10px 0;">GHS ${p.price.toFixed(2)}</div>
      <button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>
    </div>
  </div>`;
}

function closeModal(e) {
  if (e && e.target !== e.currentTarget) return;
  modals.innerHTML = '';
}

function escapeHtml(s) {
  return s?.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') || '';
}

// --- EVENT LISTENERS ---
document.getElementById('loginBtn')?.addEventListener('click', () => alert('Demo login modal soon'));
document.getElementById('checkoutBtn')?.addEventListener('click', () => alert('Checkout coming soon'));
document.getElementById('openCart')?.addEventListener('click', () => cartDrawer.classList.add('open'));
document.getElementById('closeCart')?.addEventListener('click', () => cartDrawer.classList.remove('open'));

// --- INITIALIZE ---
renderProducts(products);
renderCart();

// --- EXPORT GLOBALS ---
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increase = increase;
window.decrease = decrease;
window.viewProduct = viewProduct;
window.closeModal = closeModal;
