document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos DOM do Admin ---
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLoginSection = document.getElementById('adminLoginSection');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');

    // Produtos
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productCategoryInput = document.getElementById('productCategory');
    const productPriceInput = document.getElementById('productPrice');
    const productDescriptionInput = document.getElementById('productDescription');
    const productImageInput = document.getElementById('productImage');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const cancelEditProductBtn = document.getElementById('cancelEditProductBtn');
    const productList = document.getElementById('productList');
    const noProductsMessage = document.getElementById('noProductsMessage');
    const productSearchInput = document.getElementById('productSearch');

    // Oferta Relâmpago
    const flashDealForm = document.getElementById('flashDealForm');
    const flashDealIdInput = document.getElementById('flashDealId');
    const dealProductNameInput = document.getElementById('dealProductName');
    const dealProductOldPriceInput = document.getElementById('dealProductOldPrice');
    const dealProductNewPriceInput = document.getElementById('dealProductNewPrice');
    const dealProductDescriptionInput = document.getElementById('dealProductDescription');
    const dealProductImageInput = document.getElementById('dealProductImage');
    const dealEndTimeInput = document.getElementById('dealEndTime');
    const saveDealBtn = document.getElementById('saveDealBtn');
    const clearDealBtn = document.getElementById('clearDealBtn');
    const activeDealDisplay = document.getElementById('activeDealDisplay');

    // Depoimentos
    const testimonialList = document.getElementById('testimonialList');
    const noTestimonialsMessage = document.getElementById('noTestimonialsMessage');
    const testimonialSearchInput = document.getElementById('testimonialSearch');

    // --- Variáveis de Dados (Sincronizadas com localStorage) ---
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let flashDeal = JSON.parse(localStorage.getItem('flashDeal')) || null;
    let testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];

    // --- Funções Auxiliares ---
    function showToast(message, type = 'info', duration = 3000) {
        // Esta função deve ser definida no seu script.js principal.
        // Se `showToast` não estiver disponível aqui, descomente a versão abaixo
        // ou garanta que script.js seja carregado antes de admin.js.
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
        toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }


    // --- Lógica de Autenticação ---
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

    function showAdminPanel() {
        adminLoginSection.style.display = 'none';
        adminPanel.style.display = 'flex'; // Use flex para o layout de coluna
        renderProducts();
        renderActiveFlashDeal();
        renderTestimonialsAdmin();
    }

    function showLoginPage() {
        adminLoginSection.style.display = 'flex';
        adminPanel.style.display = 'none';
        localStorage.removeItem('adminAuth');
    }

    if (isAuthenticated) {
        showAdminPanel();
    } else {
        showLoginPage();
    }

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        // Autenticação simples (em um ambiente real, isso seria uma chamada de API para o backend)
        if (username === 'admin' && password === 'password') {
            localStorage.setItem('adminAuth', 'true');
            showAdminPanel();
            showToast('Login bem-sucedido!', 'success');
        } else {
            showToast('Usuário ou senha inválidos!', 'error');
        }
    });

    logoutBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja sair?')) {
            showLoginPage();
            showToast('Você foi desconectado.', 'info');
        }
    });

    // --- Gerenciamento de Produtos ---
    function renderProducts() {
        productList.innerHTML = ''; // Limpa a lista
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(productSearchInput.value.toLowerCase()) ||
            product.category.toLowerCase().includes(productSearchInput.value.toLowerCase()) ||
            product.description.toLowerCase().includes(productSearchInput.value.toLowerCase())
        );

        if (filteredProducts.length === 0) {
            noProductsMessage.style.display = 'block';
        } else {
            noProductsMessage.style.display = 'none';
            filteredProducts.forEach(product => {
                const li = document.createElement('li');
                li.className = 'admin-list-item';
                li.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="admin-item-details">
                        <h5>${product.name} (${product.category})</h5>
                        <p>R$ ${product.price.toFixed(2)}</p>
                        <p>${product.description.substring(0, 70)}${product.description.length > 70 ? '...' : ''}</p>
                    </div>
                    <div class="admin-item-actions">
                        <button class="edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                productList.appendChild(li);
            });
        }
    }

    function saveProduct(productData) {
        if (productData.id) { // Editando produto existente
            products = products.map(p => p.id === productData.id ? { ...productData, id: p.id } : p);
            showToast('Produto atualizado com sucesso!', 'success');
        } else { // Adicionando novo produto
            productData.id = Date.now().toString(); // ID único simples
            products.push(productData);
            showToast('Produto adicionado com sucesso!', 'success');
        }
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();
        productForm.reset();
        productIdInput.value = '';
        saveProductBtn.textContent = 'Adicionar Produto';
        cancelEditProductBtn.style.display = 'none';
        // Atualiza a exibição de produtos na home (necessário recarregar a home ou ter listener)
        if (typeof window.dispatchEvent === 'function') { // Garante que a função existe
            window.dispatchEvent(new Event('productsUpdated'));
        }
    }

    function deleteProduct(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts();
            showToast('Produto excluído!', 'info');
            // Atualiza a exibição de produtos na home
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new Event('productsUpdated'));
            }
        }
    }

    function editProduct(id) {
        const productToEdit = products.find(p => p.id === id);
        if (productToEdit) {
            productIdInput.value = productToEdit.id;
            productNameInput.value = productToEdit.name;
            productCategoryInput.value = productToEdit.category;
            productPriceInput.value = productToEdit.price;
            productDescriptionInput.value = productToEdit.description;
            productImageInput.value = productToEdit.image;

            saveProductBtn.textContent = 'Salvar Edição';
            cancelEditProductBtn.style.display = 'inline-block';
            showToast('Editando produto...', 'info');
        }
    }

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const productData = {
            id: productIdInput.value,
            name: productNameInput.value,
            category: productCategoryInput.value,
            price: parseFloat(productPriceInput.value),
            description: productDescriptionInput.value,
            image: productImageInput.value
        };
        saveProduct(productData);
    });

    cancelEditProductBtn.addEventListener('click', () => {
        productForm.reset();
        productIdInput.value = '';
        saveProductBtn.textContent = 'Adicionar Produto';
        cancelEditProductBtn.style.display = 'none';
        showToast('Edição cancelada.', 'info');
    });

    productList.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.closest('button')?.dataset.id;
        if (!id) return;

        if (target.closest('.edit-btn')) {
            editProduct(id);
        } else if (target.closest('.delete-btn')) {
            deleteProduct(id);
        }
    });

    productSearchInput.addEventListener('input', renderProducts);


    // --- Gerenciamento de Ofertas Relâmpago ---
    function renderActiveFlashDeal() {
        if (!flashDeal || new Date(flashDeal.endTime) < new Date()) {
            flashDeal = null; // Limpa a oferta se expirou
            localStorage.removeItem('flashDeal');
            activeDealDisplay.innerHTML = '<p class="no-items-message">Nenhuma oferta relâmpago ativa.</p>';
            clearDealBtn.style.display = 'none';
            flashDealForm.reset();
            flashDealIdInput.value = '';
            saveDealBtn.textContent = 'Salvar Oferta';
        } else {
            activeDealDisplay.innerHTML = `
                <h5>${flashDeal.name}</h5>
                <p>Preço Antigo: R$ ${flashDeal.oldPrice.toFixed(2)}</p>
                <p class="deal-price-display">Preço da Oferta: R$ ${flashDeal.newPrice.toFixed(2)}</p>
                <p>${flashDeal.description}</p>
                <img src="${flashDeal.image}" alt="${flashDeal.name}" class="deal-image-display">
                <p>Termina em: ${new Date(flashDeal.endTime).toLocaleString('pt-BR')}</p>
            `;
            clearDealBtn.style.display = 'inline-block';
            saveDealBtn.textContent = 'Atualizar Oferta';

            // Preenche o formulário para edição da oferta ativa
            flashDealIdInput.value = flashDeal.id; // Deve ser um ID real se for uma oferta persistente
            dealProductNameInput.value = flashDeal.name;
            dealProductOldPriceInput.value = flashDeal.oldPrice;
            dealProductNewPriceInput.value = flashDeal.newPrice;
            dealProductDescriptionInput.value = flashDeal.description;
            dealProductImageInput.value = flashDeal.image;

            // Formata a data para o input datetime-local
            const date = new Date(flashDeal.endTime);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            dealEndTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

        }
        // Dispara evento para a home saber que a oferta mudou
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new Event('flashDealUpdated'));
        }
    }

    flashDealForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dealData = {
            id: 'current-flash-deal', // ID fixo para a oferta ativa, já que só pode ter uma
            name: dealProductNameInput.value,
            oldPrice: parseFloat(dealProductOldPriceInput.value),
            newPrice: parseFloat(dealProductNewPriceInput.value),
            description: dealProductDescriptionInput.value,
            image: dealProductImageInput.value,
            endTime: dealEndTimeInput.value // Já está em formato ISO para Date
        };

        if (dealData.newPrice >= dealData.oldPrice) {
            showToast('O preço da oferta deve ser menor que o preço antigo!', 'error');
            return;
        }
        if (new Date(dealData.endTime) < new Date()) {
             showToast('A data de término da oferta não pode ser no passado!', 'error');
            return;
        }

        flashDeal = dealData;
        localStorage.setItem('flashDeal', JSON.stringify(flashDeal));
        renderActiveFlashDeal();
        showToast('Oferta relâmpago salva/atualizada!', 'success');
    });

    clearDealBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover a oferta relâmpago?')) {
            flashDeal = null;
            localStorage.removeItem('flashDeal');
            renderActiveFlashDeal();
            showToast('Oferta relâmpago removida.', 'info');
        }
    });

    // --- Gerenciamento de Depoimentos (apenas visualização e exclusão) ---
    function renderTestimonialsAdmin() {
        testimonialList.innerHTML = ''; // Limpa a lista
        const filteredTestimonials = testimonials.filter(t =>
            t.name.toLowerCase().includes(testimonialSearchInput.value.toLowerCase()) ||
            t.comments.toLowerCase().includes(testimonialSearchInput.value.toLowerCase()) ||
            (t.product && t.product.toLowerCase().includes(testimonialSearchInput.value.toLowerCase()))
        );

        if (filteredTestimonials.length === 0) {
            noTestimonialsMessage.style.display = 'block';
        } else {
            noTestimonialsMessage.style.display = 'none';
            filteredTestimonials.forEach(t => {
                const li = document.createElement('li');
                li.className = 'admin-list-item';
                const stars = '⭐'.repeat(t.rating);
                li.innerHTML = `
                    <div class="admin-item-details">
                        <h5>${t.name} <span style="font-weight: normal; color: var(--text-muted); font-size:0.8em;">(${t.date})</span></h5>
                        <p>Avaliação: ${stars}</p>
                        <p>"${t.comments.substring(0, 100)}${t.comments.length > 100 ? '...' : ''}"</p>
                        ${t.product ? `<p class="small-text">Produto: ${t.product}</p>` : ''}
                    </div>
                    <div class="admin-item-actions">
                        <button class="delete-btn" data-id="${t.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                testimonialList.appendChild(li);
            });
        }
    }

    function deleteTestimonial(id) {
        if (confirm('Tem certeza que deseja excluir este depoimento?')) {
            testimonials = testimonials.filter(t => t.id !== id);
            localStorage.setItem('testimonials', JSON.stringify(testimonials));
            renderTestimonialsAdmin();
            showToast('Depoimento excluído!', 'info');
            // Dispara evento para a home saber que depoimentos mudaram
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new Event('testimonialsUpdated'));
            }
        }
    }

    testimonialList.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.closest('button')?.dataset.id;
        if (target.closest('.delete-btn') && id) {
            deleteTestimonial(id);
        }
    });

    testimonialSearchInput.addEventListener('input', renderTestimonialsAdmin);


    // --- Sincronização de Eventos Personalizados ---
    // Adiciona listeners para atualizar as listagens se os dados mudarem via `script.js` (formulário de feedback)
    window.addEventListener('testimonialsUpdated', renderTestimonialsAdmin);
});

// Garante que showToast esteja disponível globalmente para admin.js se script.js for carregado depois
// window.showToast = showToast; // Descomente esta linha em script.js se admin.js reclamar de showToast não definida