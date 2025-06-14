document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis Globais (DOM Elements) ---
    const openMenuBtn = document.getElementById('open-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const siteContent = document.getElementById('siteContent'); // O conteúdo principal do site

    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalSpan = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const noCartItemsMessage = cartItemsList.querySelector('.no-cart-items-message');

    const backToTopBtn = document.getElementById('backToTopBtn');

    // --- Variáveis de Dados (Simulação de Banco de Dados com localStorage) ---
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Carrega o carrinho do localStorage
    let products = JSON.parse(localStorage.getItem('products')) || []; // Carrega produtos do localStorage
    let flashDeal = JSON.parse(localStorage.getItem('flashDeal')) || null; // Carrega oferta do localStorage
    let testimonials = JSON.parse(localStorage.getItem('testimonials')) || []; // Carrega depoimentos do localStorage

    // --- Funções Auxiliares ---

    // Função para mostrar toasts (mensagens temporárias)
    function showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '';
        if (type === 'success') {
            icon = '<i class="fas fa-check-circle"></i>';
        } else if (type === 'error') {
            icon = '<i class="fas fa-times-circle"></i>';
        } else {
            icon = '<i class="fas fa-info-circle"></i>';
        }

        toast.innerHTML = `${icon} <span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Força o reflow para a transição CSS funcionar
        toast.offsetWidth; 

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }

    // --- Lógica do Menu Lateral ---
    openMenuBtn.addEventListener('click', () => {
        sideMenu.classList.add('active');
        menuOverlay.classList.add('active');
        siteContent.classList.add('menu-open');
        document.body.style.overflow = 'hidden'; // Evita scroll no corpo
    });

    closeMenuBtn.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        siteContent.classList.remove('menu-open');
        document.body.style.overflow = ''; // Restaura scroll
    });

    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        siteContent.classList.remove('menu-open');
        document.body.style.overflow = '';
    });

    // Lógica para submenus (expansão/contração)
    document.querySelectorAll('.sidebar-menu .has-submenu > .submenu-toggle').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que o link navegue
            const parentLi = item.closest('li.has-submenu');
            parentLi.classList.toggle('open');
            // Fechar outros submenus abertos no mesmo nível
            document.querySelectorAll('.sidebar-menu .has-submenu.open').forEach(otherLi => {
                if (otherLi !== parentLi) {
                    otherLi.classList.remove('open');
                }
            });
        });
    });

    // --- Lógica do Carrinho de Compras ---
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        if (totalItems > 0) {
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.add('hidden');
        }
        localStorage.setItem('cart', JSON.stringify(cart)); // Salva o carrinho no localStorage
    }

    function renderCartItems() {
        cartItemsList.innerHTML = ''; // Limpa a lista existente
        let total = 0;

        if (cart.length === 0) {
            noCartItemsMessage.style.display = 'block';
            checkoutBtn.disabled = true;
            clearCartBtn.disabled = true;
        } else {
            noCartItemsMessage.style.display = 'none';
            checkoutBtn.disabled = false;
            clearCartBtn.disabled = false;
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item';
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>R$ ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity-controls">
                        <button data-id="${item.id}" data-action="decrease">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button data-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">&times;</button>
                `;
                cartItemsList.appendChild(cartItemDiv);
                total += item.price * item.quantity;
            });
        }
        cartTotalSpan.textContent = total.toFixed(2);
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        renderCartItems();
        showToast(`${product.name} adicionado ao carrinho!`, 'success');
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartCount();
        renderCartItems();
        showToast('Item removido do carrinho.', 'info');
    }

    function updateQuantity(productId, action) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                    return;
                }
            }
        }
        updateCartCount();
        renderCartItems();
    }

    cartIcon.addEventListener('click', () => {
        cartModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        renderCartItems(); // Renderiza sempre que o modal é aberto
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    // Delegar eventos para os botões do carrinho
    cartItemsList.addEventListener('click', (e) => {
        const target = e.target;
        const productId = target.dataset.id;
        if (!productId) return;

        if (target.classList.contains('cart-item-remove')) {
            removeFromCart(productId);
        } else if (target.dataset.action === 'increase' || target.dataset.action === 'decrease') {
            updateQuantity(productId, target.dataset.action);
        }
    });

    clearCartBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            cart = [];
            updateCartCount();
            renderCartItems();
            showToast('Carrinho limpo!', 'info');
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Funcionalidade de checkout em desenvolvimento! Seu pedido seria: ' + JSON.stringify(cart));
            cart = []; // Limpa o carrinho após "checkout" simulado
            updateCartCount();
            renderCartItems();
            cartModal.classList.remove('show');
            document.body.style.overflow = '';
            showToast('Compra finalizada com sucesso (simulado)!', 'success');
        } else {
            showToast('Seu carrinho está vazio!', 'error');
        }
    });

    // --- Lógica para o botão Voltar ao Topo ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) { // Mostra o botão após rolar 200px
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Rolagem suave
        });
    });

    // --- Lógica para a Seção de Feedback ---
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const rating = document.querySelector('input[name="rating"]:checked');
            const comments = document.getElementById('comments').value;

            if (!rating) {
                showToast('Por favor, selecione uma avaliação.', 'error');
                return;
            }

            const newTestimonial = {
                id: Date.now().toString(), // ID único
                name: name,
                email: email, // Opcional, pode não ser exibido publicamente
                rating: parseInt(rating.value),
                comments: comments,
                date: new Date().toLocaleDateString('pt-BR')
            };

            testimonials.unshift(newTestimonial); // Adiciona no início da lista
            localStorage.setItem('testimonials', JSON.stringify(testimonials)); // Salva no localStorage
            renderTestimonials(); // Atualiza a exibição dos depoimentos
            showToast('Obrigado pelo seu feedback!', 'success');
            feedbackForm.reset();
        });
    }

    // --- Lógica de Depoimentos (Exibição na Home) ---
    const testimonialsGrid = document.getElementById('testimonials-grid');
    const noTestimonialsMessage = document.querySelector('.testimonials-section .no-testimonials-message');

    function renderTestimonials() {
        if (!testimonialsGrid) return; // Garante que estamos na página com a grid

        testimonialsGrid.innerHTML = ''; // Limpa grid

        if (testimonials.length === 0) {
            if (noTestimonialsMessage) noTestimonialsMessage.style.display = 'block';
            return;
        } else {
            if (noTestimonialsMessage) noTestimonialsMessage.style.display = 'none';
        }

        testimonials.forEach(t => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            const stars = '⭐'.repeat(t.rating);
            card.innerHTML = `
                <div class="testimonial-header">
                    <span class="testimonial-name">${t.name}</span>
                    <span class="testimonial-stars">${stars}</span>
                </div>
                <p class="testimonial-text">"${t.comments}"</p>
                <p class="testimonial-product"><em>${t.date}</em></p>
            `;
            testimonialsGrid.appendChild(card);
        });
    }

    // --- Lógica de FAQ ---
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            faqItem.classList.toggle('open');
            // Fechar outros itens de FAQ abertos
            document.querySelectorAll('.faq-item.open').forEach(otherItem => {
                if (otherItem !== faqItem) {
                    otherItem.classList.remove('open');
                }
            });
        });
    });

    // --- Lógica de Produtos (Exibição na Home - simulando 'produtos.html') ---
    const productsContainer = document.getElementById('products-container'); // Container onde os produtos serão listados
    if (productsContainer) {
        // Função para adicionar um produto visualmente à lista (ex: na página de produtos.html)
        function addProductToDisplay(product) {
            const productCard = document.createElement('div');
            productCard.className = 'product-card'; // Você precisará estilizar .product-card
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
            `;
            productsContainer.appendChild(productCard);

            // Adiciona o evento de clique ao botão "Adicionar ao Carrinho"
            productCard.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product));
        }

        // Carregar e exibir todos os produtos
        function loadProductsForDisplay() {
            productsContainer.innerHTML = ''; // Limpa antes de renderizar
            if (products.length === 0) {
                productsContainer.innerHTML = '<p class="no-items-message">Nenhum produto disponível no momento.</p>';
                return;
            }
            products.forEach(product => addProductToDisplay(product));
        }
        loadProductsForDisplay();
    }


    // --- Lógica da Oferta Relâmpago (Exibição na Home) ---
    const flashDealContent = document.getElementById('flash-deal-content');
    const noDealMessage = document.querySelector('.flash-deal-section .no-deal-message');

    function renderFlashDeal() {
        if (!flashDealContent) return; // Garante que estamos na página com a seção de oferta

        if (!flashDeal || new Date(flashDeal.endTime) < new Date()) {
            flashDeal = null; // Limpa a oferta se expirou
            localStorage.removeItem('flashDeal'); // Remove do localStorage
            flashDealContent.innerHTML = '<p class="no-deal-message">Nenhuma oferta relâmpago ativa no momento. Fique de olho para as próximas!</p>';
            if (noDealMessage) noDealMessage.style.display = 'block';
            return;
        } else {
            if (noDealMessage) noDealMessage.style.display = 'none';
        }

        const dealCard = document.createElement('div');
        dealCard.className = 'flash-deal-card';
        dealCard.innerHTML = `
            <h3>Oferta Relâmpago!</h3>
            <div class="deal-image-container">
                <img src="${flashDeal.image}" alt="${flashDeal.name}">
            </div>
            <div class="flash-deal-details">
                <h4>${flashDeal.name}</h4>
                <p>${flashDeal.description}</p>
                <div class="flash-deal-prices">
                    <span class="original-price">R$ ${flashDeal.oldPrice.toFixed(2)}</span>
                    <span class="deal-price">R$ ${flashDeal.newPrice.toFixed(2)}</span>
                </div>
                <div class="flash-deal-timer">
                    Tempo restante: <span class="time-left" id="deal-countdown"></span>
                </div>
                <button class="btn-primary add-to-cart-btn" data-product-id="flash-deal-product">Aproveitar Oferta!</button>
            </div>
        `;
        flashDealContent.innerHTML = ''; // Limpa antes de adicionar a nova
        flashDealContent.appendChild(dealCard);

        const dealProduct = {
            id: 'flash-deal-product', // ID especial para a oferta
            name: flashDeal.name,
            price: flashDeal.newPrice,
            image: flashDeal.image
        };
        dealCard.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(dealProduct));

        // Inicia o contador regressivo
        const countdownElement = document.getElementById('deal-countdown');
        const updateCountdown = () => {
            const now = new Date().getTime();
            const endTime = new Date(flashDeal.endTime).getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                renderFlashDeal(); // Chama novamente para remover a oferta expirada
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        let countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Chama imediatamente para exibir o tempo
    }


    // --- Inicialização da Página ---
    updateCartCount(); // Atualiza o contador do carrinho ao carregar
    renderTestimonials(); // Renderiza os depoimentos ao carregar
    renderFlashDeal(); // Renderiza a oferta relâmpago ao carregar

    // Observação: `loadProductsForDisplay()` só será chamada se `products-container` existir na página.
    // Isso é útil se `index.html` não tiver todos os produtos e `produtos.html` sim.
    // Se você quiser exibir produtos na página principal, adicione um <div id="products-container"></div>
    // na sua main section e adicione um "Adicionar ao Carrinho" para cada produto.
    // O ideal seria criar um script.js para cada página ou usar módulos.
});