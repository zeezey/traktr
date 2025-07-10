document.addEventListener('DOMContentLoaded', function () {
  var cartModal = document.getElementById('cart-modal');
  var cartLink = document.getElementById('cart-link');
  var cartCount = document.getElementById('cart-count');


  function formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents);
    }
    return '$' + (cents / 100).toFixed(2);
  }

  if (cartModal) {
    var closeBtn = cartModal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        cartModal.classList.remove('open');
      });
    }
  }

  function updateCartModal(cart) {
    if (!cartModal) return;
    var container = document.getElementById('cart-modal-items');
    var totalDiv = document.getElementById('cart-modal-total');
    if (!container) return;
    container.innerHTML = '';
    var total = 0;
    cart.items.forEach(function (item) {
      var size = '';
      if (item.options_with_values) {
        item.options_with_values.forEach(function (opt) {
          if (opt.name && opt.name.toLowerCase().indexOf('size') !== -1) {
            size = opt.value;
          }
        });
        if (!size && item.options_with_values.length) {
          size = item.options_with_values[0].value;
        }
      }
      if (!size && item.variant_title && item.variant_title !== 'Default Title') {
        size = item.variant_title.split(' / ')[0];
      }
      var div = document.createElement('div');
      div.className = 'cart-item';

      var img = document.createElement('img');
      if (item.image) {
        var imgSrc = item.image;
        if (imgSrc.indexOf('?') === -1) {
          imgSrc += '?width=80';
        } else {
          imgSrc += '&width=80';
        }
        img.src = imgSrc;
      }
      img.alt = '';
      div.appendChild(img);

      var details = document.createElement('div');
      details.className = 'cart-desc';
      details.textContent =
        item.quantity +
        ' x ' +
        item.product_title +
        (size ? ' - Size: ' + size : '') +
        ' - ' +
        formatMoney(item.line_price);
      div.appendChild(details);

      container.appendChild(div);
      total += item.line_price;
    });
    if (totalDiv) {
      totalDiv.textContent = 'Total: ' + formatMoney(total);
    }
    if (cartCount) cartCount.textContent = cart.item_count;
  }

  document.querySelectorAll('form[action^="/cart/add"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      })
        .then(function () {
          return fetch('/cart.js', { headers: { 'Accept': 'application/json' } });
        })
        .then(function (resp) { return resp.json(); })
        .then(function (cart) {
          updateCartModal(cart);
          if (cartModal) cartModal.classList.add('open');
        });
    });
  });

  function openCart(e) {
    e.preventDefault();
    fetch('/cart.js', { headers: { Accept: 'application/json' } })
      .then(function (resp) { return resp.json(); })
      .then(function (cart) {
        updateCartModal(cart);
        if (cartModal) cartModal.classList.add('open');
      });
  }

  if (cartLink) {
    cartLink.addEventListener('click', openCart);
  }


  fetch('/cart.js', { headers: { Accept: 'application/json' } })
    .then(function (resp) { return resp.json(); })
    .then(function (cart) {
      if (cartCount) cartCount.textContent = cart.item_count;
    });
});
