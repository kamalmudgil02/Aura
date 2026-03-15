/**
 * store.js — Aura Ecommerce Data Layer v4
 * Color variants, site reviews, and enhanced product model
 */

const DB_PRODUCTS_KEY = 'aura_products_db_v5';
const DB_CART_KEY = 'aura_cart_db';
const DB_ORDERS_KEY = 'aura_orders_db';
const DB_CUSTOMERS_KEY = 'aura_customers_db';
const DB_SITE_REVIEWS_KEY = 'aura_site_reviews';
const DB_DISCOUNTS_KEY = 'aura_discounts';
const ADMIN_PIN = '1234';

// Preset discount codes
const DISCOUNT_CODES = [
    { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, description: '10% off your first order' },
    { code: 'FREESHIP', type: 'freeShipping', value: 0, minOrder: 0, description: 'Free shipping on any order' },
    { code: 'SAVE20', type: 'fixed', value: 20, minOrder: 100, description: '$20 off orders over $100' },
    { code: 'BOGO50', type: 'percent', value: 50, minOrder: 50, description: '50% off orders over $50' }
];

const seedProducts = [
    {
        id: "prod_1", title: "The Everyday Tee", price: 35.00, compareAtPrice: 45.00, category: "men",
        sku: "AURA-MEN-TEE-001", inventory: 120, vendor: "Aura Originals", tags: ["bestseller","basics"],
        shippingInfo: "Ships in 1-2 days · Free over $150",
        sizes: ["S","M","L","XL"], description: "A remarkably soft, odor-resistant t-shirt made with responsibly sourced eucalyptus tree fiber.",
        isNew: true, reviews: [], createdAt: "2026-03-10T10:00:00Z",
        variants: [
            { color: "#ffffff", colorName: "White", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"] },
            { color: "#1a2b4c", colorName: "Navy", images: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80"] },
            { color: "#2d2d2d", colorName: "Charcoal", images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"] }
        ]
    },
    {
        id: "prod_2", title: "Lightweight Chinos", price: 85.00, compareAtPrice: 110.00, category: "men",
        sku: "AURA-MEN-CHI-001", inventory: 65, vendor: "Aura Originals", tags: ["essentials"],
        shippingInfo: "Ships in 1-2 days · Free over $150",
        sizes: ["M","L","XL","XXL"], description: "Versatile, breathable chinos designed for all-day comfort and movement.",
        isNew: false, reviews: [], createdAt: "2026-03-08T10:00:00Z",
        variants: [
            { color: "#c9b99a", colorName: "Khaki", images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"] },
            { color: "#2d2d2d", colorName: "Black", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80"] }
        ]
    },
    {
        id: "prod_3", title: "Classic Crewneck Sweater", price: 65.00, compareAtPrice: 85.00, category: "women",
        sku: "AURA-WMN-SWT-001", inventory: 80, vendor: "Aura Originals", tags: ["layering","organic"],
        shippingInfo: "Ships in 1-2 days · Free over $150",
        sizes: ["XS","S","M","L"], description: "A timeless silhouette knitted from organic cotton. Perfect for layering.",
        isNew: true, reviews: [], createdAt: "2026-03-11T10:00:00Z",
        variants: [
            { color: "#d4c5b2", colorName: "Oatmeal", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"] },
            { color: "#8b0000", colorName: "Burgundy", images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80"] }
        ]
    },
    {
        id: "prod_4", title: "The Signature Sneaker", price: 110.00, compareAtPrice: 140.00, category: "footwear", gender: "men",
        sku: "AURA-FTW-SNK-001", inventory: 45, vendor: "Aura Originals", tags: ["bestseller","premium"],
        shippingInfo: "Ships in 2-3 days · Free over $150",
        sizes: ["7","8","9","10","11"], description: "Crafted with breathable tree fiber for a light, breezy feel.",
        isNew: false, isBestSeller: true, reviews: [], createdAt: "2026-03-05T10:00:00Z",
        variants: [
            { color: "#ffffff", colorName: "White", images: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80"] },
            { color: "#2d2d2d", colorName: "Black", images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80"] }
        ]
    },
    {
        id: "prod_5", title: "The Weekender Bag", price: 120.00, category: "accessories",
        sizes: ["One Size"], description: "Spacious and durable, featuring water-resistant materials perfect for short getaways.",
        isNew: true, reviews: [], createdAt: "2026-03-12T10:00:00Z",
        variants: [
            { color: "#5c4033", colorName: "Brown", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"] }
        ]
    },
    {
        id: "prod_6", title: "Merino Wool Beanie", price: 30.00, category: "accessories",
        sizes: ["One Size"], description: "Ultimate warmth without the itch. Ethically sourced merino wool.",
        isNew: false, reviews: [], createdAt: "2026-03-04T10:00:00Z",
        variants: [
            { color: "#2d2d2d", colorName: "Black", images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80"] },
            { color: "#8b0000", colorName: "Red", images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80"] }
        ]
    },
    {
        id: "prod_7", title: "Floral Midi Dress", price: 95.00, category: "women",
        sizes: ["XS","S","M","L","XL"], description: "Elegant floral print with a flattering A-line silhouette.",
        isNew: true, reviews: [], createdAt: "2026-03-13T10:00:00Z",
        variants: [
            { color: "#f5e6d3", colorName: "Blush", images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"] }
        ]
    },
    {
        id: "prod_8", title: "Canvas Low-Top", price: 75.00, category: "footwear", gender: "women",
        sizes: ["5","6","7","8","9"], description: "Lightweight canvas sneaker with cushioned insole.",
        isNew: true, reviews: [], createdAt: "2026-03-14T10:00:00Z",
        variants: [
            { color: "#ffffff", colorName: "White", images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80"] },
            { color: "#ff6b6b", colorName: "Coral", images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80"] }
        ]
    },
    {
        id: "prod_9", title: "Leather Belt", price: 45.00, category: "accessories",
        sizes: ["S","M","L"], description: "Full-grain leather belt with brushed nickel buckle.",
        isNew: false, reviews: [], createdAt: "2026-03-06T10:00:00Z",
        variants: [
            { color: "#5c4033", colorName: "Brown", images: ["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80"] },
            { color: "#1a1a1a", colorName: "Black", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"] }
        ]
    },
    {
        id: "prod_10", title: "Oxford Button-Down", price: 68.00, category: "men",
        sizes: ["S","M","L","XL"], description: "A wardrobe staple. Crisp oxford weave with a relaxed modern fit.",
        isNew: true, reviews: [], createdAt: "2026-03-14T12:00:00Z",
        variants: [
            { color: "#e8e8e8", colorName: "Light Grey", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"] },
            { color: "#4169e1", colorName: "Royal Blue", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80"] }
        ]
    }
];

const seedSiteReviews = [
    { id: "sr_1", name: "James D.", rating: 5, comment: "Insane quality. Fits perfectly and breathes really well. Best jacket I own.", date: "2026-03-10T10:00:00Z" },
    { id: "sr_2", name: "Sarah M.", rating: 5, comment: "Best online shopping experience. Delivery was fast and the dress is gorgeous.", date: "2026-03-09T10:00:00Z" },
    { id: "sr_3", name: "Michael T.", rating: 5, comment: "I love their sustainability mission. The sweater is literally the softest thing.", date: "2026-03-08T10:00:00Z" },
    { id: "sr_4", name: "Priya K.", rating: 4, comment: "Great minimalist designs. The shipping was quick too. Will order again!", date: "2026-03-07T10:00:00Z" },
    { id: "sr_5", name: "Alex R.", rating: 5, comment: "The sneakers are incredible. Super comfortable and look even better in person.", date: "2026-03-06T10:00:00Z" }
];

// Schema Migration
function upgradeProductSchema(product) {
    if (!product.reviews) product.reviews = [];
    if (!product.sizes) product.sizes = ["S","M","L","XL"];
    if (!product.createdAt) product.createdAt = new Date(Date.now() - Math.random()*604800000).toISOString();
    if (product.category === 'shoes') product.category = 'footwear';
    // Migrate old single-image → variants
    if (!product.variants && product.image) {
        product.variants = [{ color: "#888888", colorName: "Default", images: [product.image] }];
    }
    if (!product.variants) product.variants = [];
    return product;
}

// DB Init
function initDB() {
    if (!localStorage.getItem(DB_PRODUCTS_KEY)) {
        localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(seedProducts));
    } else {
        let products = JSON.parse(localStorage.getItem(DB_PRODUCTS_KEY));
        products = products.map(upgradeProductSchema);
        localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(products));
    }
    if (!localStorage.getItem(DB_CART_KEY)) localStorage.setItem(DB_CART_KEY, JSON.stringify([]));
    if (!localStorage.getItem(DB_ORDERS_KEY)) localStorage.setItem(DB_ORDERS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(DB_CUSTOMERS_KEY)) localStorage.setItem(DB_CUSTOMERS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(DB_SITE_REVIEWS_KEY)) localStorage.setItem(DB_SITE_REVIEWS_KEY, JSON.stringify(seedSiteReviews));
}

// Products
function getProducts() { return JSON.parse(localStorage.getItem(DB_PRODUCTS_KEY) || '[]'); }
function getProductById(id) { return getProducts().find(p => p.id === id); }
function getProductsByCategory(category) {
    let products = getProducts();
    if (category === 'new' || category === 'new-arrivals') products = products.filter(p => p.isNew);
    else products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
function saveProducts(products) {
    try {
        localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert('⚠️ Storage full! Images are too large.\n\nTip: Use smaller images or remove unused products to free space.\n\nYou can also clear old data: open DevTools → Application → Local Storage → Clear.');
        }
        throw e;
    }
}

// Helper: get primary image (first variant, first image)
function getProductImage(product) {
    if (product.variants && product.variants.length > 0 && product.variants[0].images && product.variants[0].images.length > 0) {
        return product.variants[0].images[0];
    }
    return product.image || 'https://via.placeholder.com/400x500?text=No+Image';
}

function addProduct(productData) {
    const products = getProducts();
    const newProduct = { ...productData, id: 'prod_' + Date.now(), createdAt: new Date().toISOString(), reviews: [] };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
}

function updateProduct(id, updatedData) {
    const products = getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
        const existing = products[idx];
        products[idx] = { ...existing, ...updatedData };
        if (!updatedData.reviews) products[idx].reviews = existing.reviews || [];
        if (!updatedData.createdAt) products[idx].createdAt = existing.createdAt;
        saveProducts(products);
        return true;
    }
    return false;
}

function deleteProduct(id) { saveProducts(getProducts().filter(p => p.id !== id)); }

function addReview(productId, reviewData) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
        if (!product.reviews) product.reviews = [];
        product.reviews.push({ id: 'rev_' + Date.now(), name: reviewData.name, rating: parseInt(reviewData.rating) || 5, comment: reviewData.comment, date: new Date().toISOString() });
        saveProducts(products);
        return true;
    }
    return false;
}

// Site Reviews
function getSiteReviews() { return JSON.parse(localStorage.getItem(DB_SITE_REVIEWS_KEY) || '[]'); }
function addSiteReview(reviewData) {
    const reviews = getSiteReviews();
    reviews.push({ id: 'sr_' + Date.now(), name: reviewData.name, rating: parseInt(reviewData.rating) || 5, comment: reviewData.comment, date: new Date().toISOString() });
    localStorage.setItem(DB_SITE_REVIEWS_KEY, JSON.stringify(reviews));
    return true;
}

// Cart
function getCart() { return JSON.parse(localStorage.getItem(DB_CART_KEY) || '[]'); }
function saveCart(cart) { localStorage.setItem(DB_CART_KEY, JSON.stringify(cart)); window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } })); }
function addToCart(productId, quantity = 1, size = 'M', color = 'Default') {
    const cart = getCart(); const product = getProductById(productId);
    if (!product) return false;
    const img = getProductImage(product);
    // Try to find matching variant image by color name
    let itemImage = img;
    if (product.variants) {
        const variant = product.variants.find(v => v.colorName === color);
        if (variant && variant.images && variant.images.length > 0) itemImage = variant.images[0];
    }
    const existIdx = cart.findIndex(i => i.productId === productId && i.size === size && i.color === color);
    if (existIdx !== -1) { cart[existIdx].quantity += quantity; }
    else { cart.push({ id: 'cart_' + Date.now(), productId, name: product.title, price: product.price, image: itemImage, quantity, size, color }); }
    saveCart(cart); return true;
}
function removeFromCart(id) { saveCart(getCart().filter(i => i.id !== id)); }
function updateCartItemQuantity(id, qty) { if (qty <= 0) { removeFromCart(id); return; } const cart = getCart(); const item = cart.find(i => i.id === id); if (item) { item.quantity = qty; saveCart(cart); } }
function getCartTotal() { return getCart().reduce((t, i) => t + i.price * i.quantity, 0); }
function clearCart() { saveCart([]); }

// Orders & Customers
function getOrders() { return JSON.parse(localStorage.getItem(DB_ORDERS_KEY) || '[]'); }
function getCustomers() { return JSON.parse(localStorage.getItem(DB_CUSTOMERS_KEY) || '[]'); }
function processMockCheckout(name, email) {
    const cart = getCart(); if (!cart.length) return false;
    const total = getCartTotal(); const orderId = 'ORD-' + Math.floor(Math.random()*90000+10000); const date = new Date().toISOString();
    let orders = getOrders(); orders.push({ id: orderId, customerName: name, customerEmail: email, total, itemCount: cart.reduce((s,i)=>s+i.quantity,0), status: 'Paid', date });
    localStorage.setItem(DB_ORDERS_KEY, JSON.stringify(orders));
    let customers = getCustomers(); let ex = customers.find(c=>c.email===email);
    if (ex) ex.totalValue += total; else customers.push({ id:'CUS-'+Date.now(), name, email, totalValue: total, joined: date });
    localStorage.setItem(DB_CUSTOMERS_KEY, JSON.stringify(customers));
    clearCart(); return orderId;
}

// Discount Codes
function validateDiscount(code) {
    const dc = DISCOUNT_CODES.find(d => d.code.toUpperCase() === code.toUpperCase());
    if (!dc) return { valid: false, message: 'Invalid discount code.' };
    const total = getCartTotal();
    if (dc.minOrder && total < dc.minOrder) return { valid: false, message: `Minimum order $${dc.minOrder} required.` };
    let discount = 0;
    if (dc.type === 'percent') discount = total * (dc.value / 100);
    else if (dc.type === 'fixed') discount = dc.value;
    else if (dc.type === 'freeShipping') discount = 0;
    return { valid: true, code: dc.code, type: dc.type, value: dc.value, discount, description: dc.description };
}
function getDiscountCodes() { return DISCOUNT_CODES; }

// CSV Export
function exportProductsCSV() {
    const products = getProducts();
    const headers = ['Handle','Title','Body (HTML)','Vendor','Type','Tags','Published','Option1 Name','Option1 Value','Variant SKU','Variant Price','Variant Compare At Price','Variant Inventory Qty','Image Src'];
    const rows = [];
    products.forEach(p => {
        const mainImg = getProductImage(p);
        const sizesStr = (p.sizes||[]).join(', ');
        rows.push([p.id, p.title, '"'+p.description+'"', p.vendor||'Aura Originals', p.category, (p.tags||[]).join(';'), 'TRUE', 'Size', sizesStr, p.sku||'', p.price, p.compareAtPrice||'', p.inventory||0, mainImg].join(','));
    });
    return headers.join(',') + '\n' + rows.join('\n');
}

function verifyAdmin(pin) { return pin === ADMIN_PIN; }

initDB();

window.Store = {
    getProducts, getProductById, getProductsByCategory, getProductImage,
    addProduct, updateProduct, deleteProduct, addReview,
    getSiteReviews, addSiteReview,
    getCart, addToCart, removeFromCart, updateCartItemQuantity, getCartTotal, clearCart,
    getOrders, getCustomers, processMockCheckout, verifyAdmin,
    validateDiscount, getDiscountCodes, exportProductsCSV
};
