// =========================================
// UNIVERSAL CART LOGIC (cart.js)
// =========================================

const HaloiCart = {
    key: 'haloi_cart_storage',
    items: [],

    // 1. Initialize: Load data and find HTML elements
    init() {
        const stored = localStorage.getItem(this.key);
        if (stored) {
            try { this.items = JSON.parse(stored); } 
            catch (e) { this.items = []; }
        }
        this.updateGlobalTotals(); // Update navbar number on load
        
        // If we are on a page that supports the visual drawer, render it
        if(document.getElementById('cart-items-wrapper')) {
            this.render();
        }
    },

    save() {
        localStorage.setItem(this.key, JSON.stringify(this.items));
        this.updateGlobalTotals();
    },

    // 2. Add Item
    add(product) {
        // Ensure price is a number
        let safePrice = product.price;
        if (typeof safePrice === 'string') {
            safePrice = Number(safePrice.replace(/[^0-9.]/g, ""));
        }

        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: safePrice,
                image: product.image || '',
                variant: product.variant || 'Standard',
                qty: 1
            });
        }
        this.save();
        this.render();
        this.open(); // Open drawer automatically
    },

    // 3. Update Quantity
    updateQty(id, delta) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;

        const newQty = item.qty + delta;
        if (newQty < 1) return; // Prevent going below 1

        item.qty = newQty;
        this.save(); 
        
        // Update specific DOM element if it exists
        const qtyEl = document.getElementById(`qty-val-${id}`);
        if (qtyEl) qtyEl.innerText = newQty;

        this.recalculateCartTotals();
    },

    // 4. Remove Item
    remove(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
        this.render();
    },

    // 5. Checkout
    checkout() {
        if (this.items.length === 0) return;
        alert("Redirecting to Checkout...");
        // Logic to clear cart or redirect goes here
        // this.items = []; this.save(); this.render();
    },

    // 6. UI: Open/Close
    open() {
        const overlay = document.getElementById('cart-overlay');
        const drawer = document.getElementById('cart-drawer');
        if(overlay && drawer) {
            overlay.classList.add('active');
            setTimeout(() => { drawer.classList.add('active'); }, 10);
        } else {
            console.error("Cart HTML elements missing on this page.");
        }
    },

    close() {
        const overlay = document.getElementById('cart-overlay');
        const drawer = document.getElementById('cart-drawer');
        if(drawer) drawer.classList.remove('active');
        if(overlay) setTimeout(() => { overlay.classList.remove('active'); }, 400);
    },

    // 7. Math & Formatting
    recalculateCartTotals() {
        let totalCost = 0;
        this.items.forEach(item => totalCost += (item.price * item.qty));
        
        const fmtTotal = new Intl.NumberFormat('en-IN').format(totalCost);
        const subEl = document.getElementById('cart-subtotal');
        const totEl = document.getElementById('cart-total');
        
        if(subEl) subEl.innerText = `₹${fmtTotal}`;
        if(totEl) totEl.innerText = `₹${fmtTotal}`;
    },

    updateGlobalTotals() {
        const totalQty = this.items.reduce((sum, item) => sum + item.qty, 0);
        const navEl = document.getElementById('nav-cart-count');
        
        // Supports multiple cart badges
        const badges = document.querySelectorAll('.cart-badge, #nav-cart-count');
        badges.forEach(el => el.innerText = `(${totalQty})`);
    },

    // 8. Render HTML inside Drawer
    render() {
        const container = document.getElementById('cart-items-wrapper');
        const checkoutBtn = document.getElementById('btn-checkout');
        
        // Guard clause: If current page doesn't have a cart drawer, stop.
        if (!container) return; 

        if (this.items.length === 0) {
            container.innerHTML = `<div class="empty-cart-msg" style="text-align:center; padding:40px; color:#888;">Your selection is currently empty.</div>`;
            this.recalculateCartTotals();
            if(checkoutBtn) {
                checkoutBtn.disabled = true;
                checkoutBtn.innerText = "Cart Empty";
            }
            return;
        }

        if(checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerText = "Proceed to Checkout";
        }

        let html = '';
        this.items.forEach(item => {
            const fmtPrice = new Intl.NumberFormat('en-IN').format(item.price);
            html += `
            <div class="cart-item">
                <div class="item-image" style="background:#222;">
                   ${item.image ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">` : ''}
                </div>
                <div class="item-details">
                    <div class="item-top">
                        <div>
                            <h4 class="item-name">${item.name}</h4>
                            <span class="item-variant">${item.variant}</span>
                        </div>
                        <div class="item-remove" onclick="HaloiCart.remove('${item.id}')">Remove</div>
                    </div>
                    <div class="item-bottom">
                        <div class="qty-wrapper">
                            <div class="qty-btn" onclick="HaloiCart.updateQty('${item.id}', -1)">−</div>
                            <div class="qty-val" id="qty-val-${item.id}">${item.qty}</div>
                            <div class="qty-btn" onclick="HaloiCart.updateQty('${item.id}', 1)">+</div>
                        </div>
                        <div class="item-price">₹${fmtPrice}</div>
                    </div>
                </div>
            </div>`;
        });
        
        
        container.innerHTML = html;
        this.recalculateCartTotals();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    HaloiCart.init();
});
