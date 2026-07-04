// TAROTLENS — page panier
const root = document.getElementById('cartRoot');
const { t, pick } = window.TarotLensI18n;

function render() {
    const items = window.ArcanaCart.get();

    if (!items.length) {
        root.innerHTML = `
        <div class="cart-empty">
            <p class="cart-empty-title">${t('cart_emptyTitle')}</p>
            <p style="opacity:.7;margin-bottom:20px">${t('cart_emptyText')}</p>
            <a class="btn btn-orange" href="index.html#decks">${t('cart_emptyCta')}</a>
        </div>`;
        return;
    }

    const subtotal = window.ArcanaCart.total();

    root.innerHTML = `
    <div class="cart">
        <div class="cart-lines">
            ${items.map(it => {
                const product = (window.PRODUCTS || []).find(p => p.id === it.id);
                const name = product ? pick(product, 'name') : it.name;
                const meta = product ? pick(product, 'tag') : it.meta;
                return `
                <div class="cart-line" data-key="${it.key}">
                    <div class="cart-thumb">${it.img ? `<img src="${it.img}" alt="${name}">` : it.glyph}</div>
                    <div>
                        <div class="cart-name">${name}</div>
                        ${meta ? `<div class="cart-meta">${meta}</div>` : ''}
                        <button class="cart-remove" data-remove="${it.key}">${t('cart_remove')}</button>
                    </div>
                    <div class="cart-right">
                        <div class="cart-line-price">${it.price > 0 ? (it.price * it.qty).toFixed(2).replace('.', ',') + ' €' : t('cart_preorder')}</div>
                        <div class="qty">
                            <button type="button" data-dec="${it.key}" aria-label="−">−</button>
                            <input type="number" value="${it.qty}" min="1" max="20" data-qty="${it.key}" />
                            <button type="button" data-inc="${it.key}" aria-label="+">+</button>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>

        <aside class="cart-summary">
            <h3>${t('cart_summaryTitle')}</h3>
            ${subtotal > 0
                ? `<div class="sum-row"><span>${t('cart_subtotal')}</span><span>${subtotal.toFixed(2).replace('.', ',') + ' €'}</span></div>`
                : `<div class="sum-row"><span>${t('cart_preorder')}</span><span>${t('cart_priceTBC')}</span></div>`}
            <div class="sum-row total"><span>${t('cart_totalItems')}</span><span>${items.reduce((n,i) => n + i.qty, 0)}</span></div>
            <button class="btn btn-orange" id="checkout">${t('cart_checkout')}</button>
            <button class="btn btn-ghost sm" id="clear" style="width:100%;margin-top:10px;text-align:center">${t('cart_clear')}</button>
        </aside>
    </div>`;

    root.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => { const k = b.dataset.inc; const it = items.find(x => x.key === k); window.ArcanaCart.setQty(k, it.qty + 1); render(); });
    root.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { const k = b.dataset.dec; const it = items.find(x => x.key === k); window.ArcanaCart.setQty(k, it.qty - 1); render(); });
    root.querySelectorAll('[data-qty]').forEach(inp => inp.onchange = () => { window.ArcanaCart.setQty(inp.dataset.qty, +inp.value || 1); render(); });
    root.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => { window.ArcanaCart.remove(b.dataset.remove); render(); });
    document.getElementById('clear').onclick = () => { window.ArcanaCart.clear(); render(); };
    document.getElementById('checkout').onclick = () => {
        root.innerHTML = `<div class="cart-empty"><p class="cart-empty-title">${t('cart_thanksTitle')}</p><p style="opacity:.7;margin-bottom:20px">${t('cart_thanksText')}</p><a class="btn btn-orange" href="index.html">${t('cart_backHome')}</a></div>`;
        window.ArcanaCart.clear();
    };
}

render();
