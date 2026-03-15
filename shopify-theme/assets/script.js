/**
 * script.js — Aura Storefront Logic v5
 * Scroll belts, color variants, feedback, reviews, password gate
 */
document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // Store Password Gate (Shopify-style dev store protection)
    // =========================================================================
    const STORE_PASSWORD = 'aura2026';
    const isAdmin = window.location.pathname.includes('admin');
    if (!isAdmin && !sessionStorage.getItem('aura_store_unlocked')) {
        const gate = document.createElement('div');
        gate.id = 'password-gate';
        gate.innerHTML = `
            <div class="gate-box">
                <h1 style="font-family:'Playfair Display',serif; font-size:2.5rem; margin-bottom:8px;">Aura.</h1>
                <p style="opacity:0.7; margin-bottom:24px; font-size:0.9rem;">This store is password protected.<br>Enter password to continue.</p>
                <form id="gate-form">
                    <input type="password" id="gate-password" placeholder="Password" autocomplete="off">
                    <button type="submit">Enter Store</button>
                    <p id="gate-error" style="color:#ff6b6b; margin-top:12px; font-size:0.8rem; display:none;">Incorrect password. Try again.</p>
                </form>
            </div>`;
        document.body.prepend(gate);
        document.getElementById('gate-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('gate-password').value;
            if (val === STORE_PASSWORD) {
                sessionStorage.setItem('aura_store_unlocked', '1');
                window.location.reload();
            } else {
                document.getElementById('gate-error').style.display = 'block';
                document.getElementById('gate-password').value = '';
            }
        });
        return; // Don't initialize rest of store until unlocked
    }

    // Header scroll
    const header = document.querySelector('.site-header');
    if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20));

    // Mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('active'));
        mobileMenu.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('active')));
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const id = this.getAttribute('href'); if (id === '#') return;
            const el = document.querySelector(id);
            if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    // Search
    const searchToggle = document.getElementById('search-toggle-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('close-search-btn');
    const searchInput = document.getElementById('global-search-input');
    const searchResultsC = document.getElementById('search-results-container');
    const searchResultsG = document.getElementById('search-results-grid');
    if (searchToggle && searchOverlay) {
        searchToggle.addEventListener('click', () => { searchOverlay.classList.toggle('active'); if (searchOverlay.classList.contains('active')) searchInput.focus(); });
        searchClose.addEventListener('click', () => { searchOverlay.classList.remove('active'); searchInput.value = ''; searchResultsC.style.display = 'none'; });
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (!q || q.length < 2) { searchResultsC.style.display = 'none'; return; }
            const results = window.Store.getProducts().filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
            searchResultsC.style.display = 'block';
            searchResultsG.innerHTML = results.length ? results.slice(0,8).map(createCardHTML).join('') : '<div class="text-muted col-span-full p-4 text-center">No products found.</div>';
        });
    }

    // =========================================================================
    // Product Card HTML
    // =========================================================================
    function createCardHTML(product) {
        const img = window.Store.getProductImage(product);
        const sizesStr = product.sizes ? product.sizes.join(', ') : '';
        return `
        <div class="product-card">
            <a href="/pages/product#${product.id}" style="text-decoration:none;color:inherit;">
                <div class="product-image-container mb-2">
                    <img src="${img}" loading="lazy" alt="${product.title}">
                    ${product.isNew ? '<span class="badge badge-new-product absolute-top-left">New</span>' : ''}
                    ${product.isBestSeller ? '<span class="badge absolute-top-left" style="background:var(--color-primary);color:#fff">Best Seller</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">${product.compareAtPrice ? '<span class="compare-price">$'+product.compareAtPrice.toFixed(2)+'</span> ' : ''}$${product.price.toFixed(2)}${product.compareAtPrice ? ' <span class="sale-tag">Sale</span>' : ''}</p>
                    ${sizesStr ? '<p class="product-sizes">Sizes: ' + sizesStr + '</p>' : ''}
                </div>
            </a>
            <button class="btn btn-outline quick-add-btn" onclick="handleQuickAdd('${product.id}')">Quick Add</button>
        </div>`;
    }

    window.handleQuickAdd = function(id) {
        const p = window.Store.getProductById(id);
        const sz = p && p.sizes ? p.sizes[0] : 'M';
        const col = p && p.variants && p.variants.length ? p.variants[0].colorName : 'Default';
        window.Store.addToCart(id, 1, sz, col);
        openCartDrawer();
    };

    // =========================================================================
    // Homepage Belt Renderer
    // =========================================================================
    function renderBelt(containerId, products, seeMoreId) {
        const belt = document.getElementById(containerId);
        if (!belt) return;
        const items = products.slice(0, 6);
        belt.innerHTML = items.length ? items.map(createCardHTML).join('') : '<div class="text-muted p-4 text-center" style="min-width:200px">Coming soon</div>';
        const sm = document.getElementById(seeMoreId);
        if (sm) sm.style.display = products.length > 6 ? 'block' : 'none';
    }

    // Homepage sections
    if (document.getElementById('home-men-belt') && window.Store) {
        renderBelt('home-men-belt', window.Store.getProductsByCategory('men'), 'men-see-more');
        renderBelt('home-women-belt', window.Store.getProductsByCategory('women'), 'women-see-more');
        renderBelt('home-accessories-belt', window.Store.getProductsByCategory('accessories'), 'accessories-see-more');

        // Footwear
        const allFootwear = window.Store.getProductsByCategory('footwear');
        function renderFW(filter) {
            let f = allFootwear;
            if (filter === 'men') f = allFootwear.filter(p => p.gender === 'men' || p.gender === 'unisex');
            else if (filter === 'women') f = allFootwear.filter(p => p.gender === 'women' || p.gender === 'unisex');
            renderBelt('home-footwear-belt', f, 'footwear-see-more');
        }
        renderFW('all');
        document.querySelectorAll('#footwear-filter .filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#footwear-filter .filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active'); renderFW(tab.dataset.filter);
            });
        });

        // Hero slider
        initHeroSlider(window.Store.getProductsByCategory('new').slice(0, 5));
        // Site reviews belt
        renderReviewsBelt();
        // Best sellers grid
        renderBestSellers();
    }

    // =========================================================================
    // Best Sellers Grid
    // =========================================================================
    function renderBestSellers() {
        const grid = document.getElementById('bestsellers-grid');
        if (!grid || !window.Store) return;
        const products = window.Store.getProducts();
        // Products with compareAtPrice = on sale = best seller candidates
        const bestSellers = products.filter(p => p.compareAtPrice || p.isBestSeller).slice(0, 4);
        if (!bestSellers.length) {
            const g = document.querySelector('.bestsellers-section');
            if (g) g.style.display = 'none';
            return;
        }
        grid.innerHTML = bestSellers.map(createCardHTML).join('');
    }

    // =========================================================================
    // Reviews Belt
    // =========================================================================
    function renderReviewsBelt() {
        const belt = document.getElementById('reviews-belt');
        if (!belt || !window.Store) return;
        const reviews = window.Store.getSiteReviews();
        belt.innerHTML = reviews.length ? reviews.map(r => `
            <div class="testimonial-card">
                <div class="testimonial-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                <p class="testimonial-text">"${r.comment}"</p>
                <span class="testimonial-author">— ${r.name}</span>
            </div>
        `).join('') : '<div class="text-muted p-4">No reviews yet. Be the first!</div>';
    }

    // Feedback form
    const fbForm = document.getElementById('site-feedback-form');
    if (fbForm && window.Store) {
        fbForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('fb-name').value;
            const rating = document.getElementById('fb-rating').value;
            const comment = document.getElementById('fb-comment').value;
            if (name && comment) {
                window.Store.addSiteReview({ name, rating, comment });
                fbForm.reset();
                renderReviewsBelt();
                alert('Thank you for your feedback! ✓');
            }
        });
    }

    // =========================================================================
    // Hero Slider
    // =========================================================================
    function initHeroSlider(slides) {
        const track = document.getElementById('hero-slider-track');
        const dotsC = document.getElementById('slider-dots');
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');
        if (!track) return;
        if (!slides.length) { track.innerHTML = '<div class="hero-slide" style="background:linear-gradient(135deg,#1a1a2e,#16213e);"><div class="hero-slide-content"><h2>Welcome to Aura</h2><p>Premium minimalist essentials</p></div></div>'; return; }
        track.innerHTML = slides.map(s => {
            const img = window.Store.getProductImage(s);
            return `<div class="hero-slide" style="background-image:url('${img}');"><div class="hero-slide-content"><span class="badge-new">Just Dropped</span><h2>${s.title}</h2><p>$${s.price.toFixed(2)}</p><a href="/pages/product#${s.id}" class="btn btn-large">Shop Now</a></div></div>`;
        }).join('');
        let idx = 0; const total = slides.length;
        if (dotsC) { dotsC.innerHTML = slides.map((_,i) => `<button class="slider-dot ${i===0?'active':''}" data-idx="${i}"></button>`).join(''); }
        const dots = dotsC ? dotsC.querySelectorAll('.slider-dot') : [];
        function goTo(i) { if (i<0) i=total-1; if (i>=total) i=0; idx=i; track.style.transform=`translateX(-${idx*100}%)`; dots.forEach((d,j)=>d.classList.toggle('active',j===idx)); }
        if (prevBtn) prevBtn.addEventListener('click', () => goTo(idx-1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(idx+1));
        dots.forEach(d => d.addEventListener('click', () => goTo(parseInt(d.dataset.idx))));
        setInterval(() => goTo(idx+1), 4000);
    }

    // =========================================================================
    // Collection Page
    // =========================================================================
    const collectionGrid = document.getElementById('collection-grid');
    if (collectionGrid && window.Store) {
        // Read category from hash first (hash-based routing), fall back to query params
        const hashCat = window.location.hash.replace('#','').toLowerCase();
        const paramsCat = new URLSearchParams(window.location.search).get('category');
        const category = hashCat || paramsCat || 'all';
        const titleEl = document.getElementById('collection-title');
        const names = { men: "Men's Collection", women: "Women's Collection", footwear: "Footwear", accessories: "Accessories", all: "All Products" };
        if (titleEl) titleEl.textContent = names[category] || category.charAt(0).toUpperCase() + category.slice(1);
        let products = category === 'all' ? window.Store.getProducts() : window.Store.getProductsByCategory(category);
        const countEl = document.getElementById('product-count');
        if (countEl) countEl.textContent = `${products.length} products`;
        function renderColl(prods) { collectionGrid.innerHTML = prods.length ? prods.map(createCardHTML).join('') : '<div class="text-muted col-span-full p-4 text-center">No products found.</div>'; }
        renderColl(products);
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.addEventListener('change', (e) => { let s=[...products]; if(e.target.value==='price-low') s.sort((a,b)=>a.price-b.price); else if(e.target.value==='price-high') s.sort((a,b)=>b.price-a.price); renderColl(s); });
    }

    // =========================================================================
    // Cart Drawer
    // =========================================================================
    const cartToggle = document.getElementById('cart-toggle');
    const closeCartBtn = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsC = document.getElementById('cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const headerCounts = document.querySelectorAll('.cart-count');

    function openCartDrawer() { if (cartDrawer && cartOverlay) { cartDrawer.classList.add('active'); cartOverlay.classList.add('active'); renderCartItems(); } }
    function closeCartDrawer() { if (cartDrawer && cartOverlay) { cartDrawer.classList.remove('active'); cartOverlay.classList.remove('active'); } }
    if (cartToggle) cartToggle.addEventListener('click', openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    window.cartChangeQty = (id, ch) => { const cart=window.Store.getCart(); const item=cart.find(i=>i.id===id); if(item) window.Store.updateCartItemQuantity(id,item.quantity+ch); };
    window.cartRemoveItem = (id) => window.Store.removeFromCart(id);

    function renderCartItems() {
        if (!cartItemsC || !window.Store) return;
        const cart = window.Store.getCart(); const total = window.Store.getCartTotal();
        const totalItems = cart.reduce((s,i)=>s+i.quantity,0);
        headerCounts.forEach(el => { el.textContent = totalItems; el.style.display = totalItems > 0 ? 'flex' : 'none'; });
        if (cartSubtotal) cartSubtotal.textContent = `$${total.toFixed(2)}`;
        if (!cart.length) { cartItemsC.innerHTML = '<p class="text-muted text-center mt-8">Your cart is empty.</p>'; return; }
        cartItemsC.innerHTML = cart.map(item => `
            <div class="cart-item"><img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details"><div class="flex justify-between"><h4 class="text-sm fw-medium">${item.name}</h4><button class="action-btn" onclick="cartRemoveItem('${item.id}')">&times;</button></div>
            <p class="text-xs text-muted mt-1">${item.size} / ${item.color}</p>
            <div class="flex justify-between align-center mt-auto pt-2"><div class="qty-control"><button class="qty-btn" onclick="cartChangeQty('${item.id}',-1)">−</button><input type="text" class="qty-input" value="${item.quantity}" readonly><button class="qty-btn" onclick="cartChangeQty('${item.id}',1)">+</button></div><span class="text-sm fw-semibold">$${(item.price*item.quantity).toFixed(2)}</span></div></div></div>
        `).join('');
    }
    window.addEventListener('cartUpdated', renderCartItems); renderCartItems();

    // Mock checkout
    const ckBtn = document.getElementById('btn-mock-checkout');
    const ckMsg = document.getElementById('checkout-msg');
    if (ckBtn && ckMsg) {
        ckBtn.addEventListener('click', () => {
            const name = prompt("Enter your name:"); if (!name) return;
            const email = prompt("Enter your email:"); if (!email) return;
            const orderId = window.Store.processMockCheckout(name, email);
            if (orderId) { ckMsg.style.display='block'; ckMsg.textContent=`✓ Order ${orderId} placed!`; ckBtn.style.display='none'; setTimeout(()=>{ckMsg.style.display='none'; ckBtn.style.display='block'; closeCartDrawer();},3000); }
        });
    }

    // =========================================================================
    // PDP — Product Detail Page (hash routing, color variants)
    // =========================================================================
    const pdpTitle = document.getElementById('pdp-title');
    if (pdpTitle && window.Store) {
        const productId = window.location.hash.replace('#','');
        const product = productId ? window.Store.getProductById(productId) : null;

        if (product) {
            document.title = `${product.title} — Aura`;
            pdpTitle.textContent = product.title;
            // Compare-at price
            const priceEl = document.getElementById('pdp-price');
            if (product.compareAtPrice) {
                priceEl.innerHTML = `<span class="compare-price">$${product.compareAtPrice.toFixed(2)}</span> $${product.price.toFixed(2)} <span class="sale-tag">Save $${(product.compareAtPrice - product.price).toFixed(0)}</span>`;
            } else {
                priceEl.textContent = `$${product.price.toFixed(2)}`;
            }
            document.getElementById('pdp-desc').textContent = product.description;

            // Trust badges
            const trustEl = document.getElementById('pdp-trust-badges');
            if (trustEl) trustEl.innerHTML = `<div class="trust-badges"><span class="trust-badge">🔒 Secure Checkout</span><span class="trust-badge">🚚 ${product.shippingInfo || 'Ships in 1-2 days'}</span><span class="trust-badge">↩️ 30-Day Returns</span><span class="trust-badge">✅ Quality Guaranteed</span></div>`;

            // SKU & Inventory
            const skuEl = document.getElementById('pdp-sku');
            if (skuEl && product.sku) skuEl.innerHTML = `<span class="text-xs text-muted">SKU: ${product.sku}</span>${product.inventory > 0 ? '<span class="text-xs" style="color:var(--color-success);margin-left:8px;">✓ In Stock ('+product.inventory+')</span>' : '<span class="text-xs" style="color:#d93025;margin-left:8px;">Out of Stock</span>'}`;

            const breadcrumbTitle = document.getElementById('pdp-breadcrumb-title');
            const categoryLink = document.getElementById('pdp-category-link');
            if (breadcrumbTitle) breadcrumbTitle.textContent = product.title;
            if (categoryLink) { categoryLink.href = `/pages/collection#${product.category}`; categoryLink.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1); }

            // Color Variants
            const variants = product.variants || [];
            let activeVariant = 0;
            const colorSwatches = document.getElementById('pdp-color-swatches');
            const colorNameEl = document.getElementById('selected-color-name');
            const mainImg = document.getElementById('main-product-image');
            const thumbGrid = document.getElementById('pdp-thumb-grid');

            function setVariant(idx) {
                activeVariant = idx;
                const v = variants[idx];
                if (!v) return;
                if (colorNameEl) colorNameEl.textContent = v.colorName;
                if (mainImg && v.images && v.images.length) { mainImg.src = v.images[0]; mainImg.alt = product.title + ' - ' + v.colorName; }
                // Update thumbnails
                if (thumbGrid && v.images) {
                    thumbGrid.innerHTML = v.images.map((img, i) =>
                        `<div class="thumbnail ${i===0?'active':''}" onclick="setThumb(this, '${img}')"><img src="${img}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" alt="View ${i+1}"></div>`
                    ).join('');
                }
                // Update swatch active states
                if (colorSwatches) colorSwatches.querySelectorAll('.color-option').forEach((s,i) => s.classList.toggle('active', i===idx));
            }

            window.setThumb = function(el, src) {
                if (mainImg) mainImg.src = src;
                if (thumbGrid) thumbGrid.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                el.classList.add('active');
            };

            // Render color swatches
            if (colorSwatches && variants.length) {
                colorSwatches.innerHTML = variants.map((v, i) =>
                    `<button class="color-option ${i===0?'active':''}" aria-label="${v.colorName}" title="${v.colorName}" onclick="document.dispatchEvent(new CustomEvent('setVariant',{detail:${i}}))"><span class="color-option-inner" style="background:${v.color};"></span></button>`
                ).join('');
            }
            document.addEventListener('setVariant', (e) => setVariant(e.detail));
            setVariant(0);

            // Sizes
            const sizesContainer = document.getElementById('pdp-sizes-container');
            if (sizesContainer && product.sizes) {
                sizesContainer.innerHTML = product.sizes.map((s, i) => `<button class="size-option ${i===0?'active':''}">${s}</button>`).join('');
                sizesContainer.querySelectorAll('.size-option').forEach(opt => {
                    opt.addEventListener('click', function() { sizesContainer.querySelectorAll('.size-option').forEach(o=>o.classList.remove('active')); this.classList.add('active'); });
                });
            }

            // Add to Cart
            const addToCartHandler = () => {
                const sizeEl = document.querySelector('.size-option.active');
                const sizeVal = sizeEl ? sizeEl.textContent.trim() : (product.sizes ? product.sizes[0] : 'M');
                const colorVal = variants[activeVariant] ? variants[activeVariant].colorName : 'Default';
                window.Store.addToCart(product.id, 1, sizeVal, colorVal);
                openCartDrawer();
            };
            const dBtn = document.getElementById('pdp-add-to-cart-btn');
            const sBtn = document.getElementById('pdp-sticky-add-btn');
            if (dBtn) { dBtn.addEventListener('click', addToCartHandler); dBtn.textContent = `Add to Cart — $${product.price.toFixed(2)}`; }
            if (sBtn) { sBtn.addEventListener('click', addToCartHandler); sBtn.textContent = `Add to Cart — $${product.price.toFixed(2)}`; }

            // Reviews
            const reviewForm = document.getElementById('review-form');
            const reviewsList = document.getElementById('reviews-list');
            const starAvgEl = document.getElementById('pdp-star-avg');
            const revCountEl = document.getElementById('pdp-review-count');
            function renderReviews() {
                const cur = window.Store.getProductById(productId);
                const revs = cur.reviews || [];
                if (revCountEl) revCountEl.textContent = `(${revs.length} Reviews)`;
                if (revs.length > 0) {
                    const avg = revs.reduce((s,r)=>s+r.rating,0)/revs.length;
                    if (starAvgEl) starAvgEl.innerHTML = '★'.repeat(Math.round(avg))+'<span style="color:#ddd">★</span>'.repeat(5-Math.round(avg));
                    if (reviewsList) reviewsList.innerHTML = revs.map(r => `<div class="review-item"><div class="flex justify-between mb-2"><span class="fw-semibold text-sm">${r.name}</span><span class="text-xs text-muted">${new Date(r.date).toLocaleDateString()}</span></div><div class="text-sm mb-2" style="color:#f5a623">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><p class="text-sm text-muted">${r.comment}</p></div>`).join('');
                } else {
                    if (starAvgEl) starAvgEl.innerHTML = '★★★★★';
                    if (reviewsList) reviewsList.innerHTML = '<p class="text-muted text-sm">No reviews yet. Be the first!</p>';
                }
            }
            if (reviewForm) {
                reviewForm.addEventListener('submit', (e) => { e.preventDefault(); const n=document.getElementById('review-name').value; const r=document.getElementById('review-rating').value; const c=document.getElementById('review-comment').value; if(n&&c){window.Store.addReview(productId,{name:n,rating:r,comment:c}); reviewForm.reset(); renderReviews();} });
            }
            renderReviews();
        } else {
            pdpTitle.textContent = "Product Not Found";
            const cc = document.getElementById('pdp-content-container');
            if (cc) cc.innerHTML = '<div class="col-span-full p-6 text-center text-muted"><p class="mb-4">The product you\'re looking for doesn\'t exist.</p><a href="/" class="btn btn-primary">Return Home</a></div>';
        }
    }

    // Accordion
    document.querySelectorAll('.accordion-header').forEach(h => h.addEventListener('click', function() { this.parentElement.classList.toggle('active'); }));

    // =========================================================================
    // Discount Code in Cart
    // =========================================================================
    const discountInput = document.getElementById('discount-code-input');
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    const discountResult = document.getElementById('discount-result');
    if (applyDiscountBtn && discountInput && window.Store) {
        applyDiscountBtn.addEventListener('click', () => {
            const code = discountInput.value.trim();
            if (!code) return;
            const result = window.Store.validateDiscount(code);
            discountResult.style.display = 'block';
            if (result.valid) {
                discountResult.style.color = 'var(--color-success)';
                if (result.type === 'freeShipping') {
                    discountResult.textContent = `✓ ${result.description} applied!`;
                } else {
                    discountResult.textContent = `✓ ${result.description} — You save $${result.discount.toFixed(2)}!`;
                }
            } else {
                discountResult.style.color = '#d93025';
                discountResult.textContent = `✗ ${result.message}`;
            }
        });
    }

    // =========================================================================
    // Cart Upsells ("You May Also Like")
    // =========================================================================
    function renderUpsells() {
        const upsellContainer = document.getElementById('cart-upsells');
        const upsellItems = document.getElementById('upsell-items');
        if (!upsellContainer || !upsellItems || !window.Store) return;
        const cart = window.Store.getCart();
        if (!cart.length) { upsellContainer.style.display = 'none'; return; }
        const cartIds = cart.map(i => i.productId);
        const all = window.Store.getProducts().filter(p => !cartIds.includes(p.id));
        const picks = all.sort(() => 0.5 - Math.random()).slice(0, 3);
        if (!picks.length) { upsellContainer.style.display = 'none'; return; }
        upsellContainer.style.display = 'block';
        upsellItems.innerHTML = picks.map(p => {
            const img = window.Store.getProductImage(p);
            return `<div style="min-width:110px;text-align:center;flex-shrink:0;"><a href="/pages/product#${p.id}"><img src="${img}" style="width:100px;height:100px;object-fit:cover;border-radius:var(--radius-sm);"></a><p class="text-xs fw-medium mt-1">${p.title}</p><p class="text-xs text-muted">$${p.price.toFixed(2)}</p></div>`;
        }).join('');
    }
    window.addEventListener('cartUpdated', renderUpsells);

    // =========================================================================
    // Email Collection Popup (First Visit Only)
    // =========================================================================
    if (!localStorage.getItem('aura_email_popup_shown') && document.getElementById('home-men-belt')) {
        setTimeout(() => {
            const popup = document.createElement('div');
            popup.id = 'email-popup';
            popup.innerHTML = `
                <div class="email-popup-overlay" onclick="document.getElementById('email-popup').remove();"></div>
                <div class="email-popup-modal">
                    <button class="email-popup-close" onclick="document.getElementById('email-popup').remove();">&times;</button>
                    <h2 class="text-2xl mb-2">Get 10% Off</h2>
                    <p class="text-sm text-muted mb-4">Subscribe to our newsletter and get <strong>10% off</strong> your first order. Use code <strong>WELCOME10</strong> at checkout.</p>
                    <form onsubmit="event.preventDefault(); localStorage.setItem('aura_email_popup_shown','1'); this.querySelector('input').value='Subscribed! ✓'; this.querySelector('button').disabled=true; setTimeout(()=>document.getElementById('email-popup').remove(),1500);">
                        <div class="flex gap-2"><input type="email" class="form-control" placeholder="Enter your email" required style="flex:1;"><button type="submit" class="btn btn-primary">Subscribe</button></div>
                    </form>
                </div>`;
            document.body.appendChild(popup);
            localStorage.setItem('aura_email_popup_shown', '1');
        }, 5000);
    }

    // =========================================================================
    // Admin: CSV Export & Store Password
    // =========================================================================
    const csvBtn = document.getElementById('btn-export-csv');
    if (csvBtn && window.Store) {
        csvBtn.addEventListener('click', () => {
            const csv = window.Store.exportProductsCSV();
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'aura_products.csv'; a.click();
            URL.revokeObjectURL(url);
        });
    }

});
