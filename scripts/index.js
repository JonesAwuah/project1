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
function showAdminLogin() {
  const modals = document.getElementById('modals');
  modals.innerHTML = `
  <div class="modal-backdrop" onclick="closeModal(event)">
    <div class="modal" style="max-width:420px" onclick="event.stopPropagation()">
      <div style="padding:18px">
        <h3>Admin Login Required</h3>
        <p style="color:var(--muted);font-size:13px;margin-bottom:10px">
          Please enter your admin username and password to access the Sell page.
        </p>

        <label>Username</label>
        <input id="adminUser" type="text" style="margin-bottom:8px" />

        <label>Password</label>
        <input id="adminPass" type="password" style="margin-bottom:12px" />

        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn alt" onclick="closeModal()">Cancel</button>
          <button class="btn" onclick="verifyAdmin()">Login</button>
        </div>
      </div>
    </div>
  </div>`;
}

// --- VERIFY ADMIN ---
function verifyAdmin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();

  // Demo credentials (change these to your own)
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "1234";

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    closeModal();
    window.location.href = "sell.html";
  } else {
    alert("Invalid admin credentials. Access denied.");
  }
}

// --- SELL BUTTON INTERCEPT ---
document.querySelector('a[href="sell.html"]').addEventListener('click', function(e) {
  e.preventDefault();
  showAdminLogin();
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
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (query) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    renderProducts(filtered);
  }

  // --- ACTIVE BUTTON HIGHLIGHT ---
  function setActiveFilter(button) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // also update dropdown
    const select = document.getElementById('filterCategory');
    if (select) select.value = button.textContent;
  }

  // --- SIDEBAR CATEGORY CHANGE ---
  function onCategoryChange(value) {
    filterAndRender(value);

    // also highlight matching quick filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === value);
      if (value === 'All' && btn.textContent === 'All') btn.classList.add('active');
    });
  }





// --- FILTER + SORT FUNCTION ---
/// Track current category and search query
let currentCategory = 'All';
let currentQuery = '';

// --- FILTER + SORT FUNCTION ---
function filterAndRender(category = currentCategory, query = currentQuery) {
  currentCategory = category;
  currentQuery = query;

  // Start with all products
  let filtered = [...products];

  // 1️⃣ Filter by category
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }

  // 2️⃣ Filter by search query (optional)
  if (query) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  // 3️⃣ Apply sorting
  const sortValue = document.getElementById('sortBy').value;
  filtered = sortProducts(filtered, sortValue);

  // Render filtered + sorted products
  renderProducts(filtered);
}

// --- SORT FUNCTION ---
function sortProducts(list, sortValue) {
  switch (sortValue) {
    case 'price_asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return list.sort((a, b) => b.price - a.price);
    default:
      return list; // "Most relevant" or original order
  }
}

// --- SORT CHANGE HANDLER ---
function applySort(value) {
  // Re-render current category and query with new sort
  filterAndRender(currentCategory, currentQuery);
}

// --- OPTIONAL: SEARCH INTEGRATION ---
document.getElementById('search').addEventListener('input', e => {
  currentQuery = e.target.value.trim();
  filterAndRender(currentCategory, currentQuery);
});

// --- QUICK FILTER BUTTONS & SIDEBAR CATEGORY SELECT ---
// Example integration for buttons/select
function setActiveFilter(button) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');

  const select = document.getElementById('filterCategory');
  if (select) select.value = button.textContent;

  filterAndRender(button.textContent, currentQuery);
}

function onCategoryChange(value) {
  currentCategory = value;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === value);
    if (value === 'All' && btn.textContent === 'All') btn.classList.add('active');
  });

  filterAndRender(value, currentQuery);
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

  // Add a header with close button above the items
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3 style="margin:0;">Your Cart</h3>
      <button onclick="cartDrawer.classList.remove('open')" 
              style="background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>
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

// --- PRODUCT VIEW ---
function viewProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  modals.innerHTML = `
  <div class="modal-backdrop" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:700px; position:relative;">
      
      <!-- Close Button -->
      <button onclick="closeModal()" 
              style="position:absolute; top:10px; right:10px; background:none; border:none; font-size:22px; cursor:pointer;">
        &times;
      </button>

      <!-- Product Image -->
      <div class="media" style="text-align:center; margin-bottom:20px;">
        <img src="${p.img}" 
             style="width:100%; height:auto; max-height:550px; object-fit:contain; border-radius:10px;">
      </div>

      <!-- Product Content -->
      <div class="content" style="text-align:center;">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.desc)}</p>
        <div style="font-weight:700; margin:10px 0;">GHS ${p.price.toFixed(2)}</div>
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
