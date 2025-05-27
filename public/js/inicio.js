    document.addEventListener("DOMContentLoaded", () => {
    // Elementos principales
    const categoriaForm = document.getElementById("categoriaForm");
    const productoForm = document.getElementById("productoForm");
    const categoriasContainer = document.getElementById("categorias");
    const productoContainer = document.getElementById("productos");
    const cantidadModal = new bootstrap.Modal(document.getElementById('cantidadModal'));
    const btnAgregarProducto = document.getElementById("btnAgregarProducto");
    const categoriaProductoSelect = document.getElementById("categoriaProducto");
    
    // Elementos para cantidad
    const productQuantityInput = document.getElementById("productQuantity");
    const decrementQuantityBtn = document.getElementById("decrementQuantity");
    const incrementQuantityBtn = document.getElementById("incrementQuantity");
    const confirmAddToSidebarBtn = document.getElementById("confirmAddToSidebar");
    
    // Variables de estado
    let currentProduct = null;
    let currentQuantity = 1;
    let currentCategory = null;

    // Sistema de actualización dinámica
    function actualizarSidebar() {
        const event = new CustomEvent('actualizarSidebar');
        document.dispatchEvent(event);
    }

    // Evento para agregar categoría
    categoriaForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const nombre = document.getElementById("nombreCategoria").value;
        
        if (!nombre.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor ingresa un nombre para la categoría',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        
        const categoria = { id: Date.now(), nombre: nombre };
        
        guardarCategoria(categoria);
        crearCardCategoria(categoria);
        categoriaForm.reset();
        new bootstrap.Modal(document.getElementById('categoriaModal'));
        
        Swal.fire({
            title: '¡Éxito!',
            text: 'Categoría agregada correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 1500,
            timerProgressBar: true
        });
    });

    // Evento para agregar producto
    productoForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const categoriaId = parseInt(document.getElementById("categoriaProducto").value);
        const nombre = document.getElementById("nombreProducto").value;
        const precio = parseFloat(document.getElementById("precioProducto").value);
        const imagenInput = document.getElementById("imagenProducto");
        const imagenURL = imagenInput.files.length > 0 ? URL.createObjectURL(imagenInput.files[0]) : "https://via.placeholder.com/150";

        // Validaciones
        if (!nombre.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor ingresa un nombre para el producto',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        if (isNaN(precio) || precio <= 0) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor ingresa un precio válido',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const producto = {
            id: Date.now(),
            categoriaId: categoriaId,
            nombre: nombre,
            precio: precio,
            imagenURL: imagenURL
        };

        guardarProducto(producto);
        crearCardProducto(producto);
        productoForm.reset();
        imagenInput.value = '';
        new bootstrap.Modal(document.getElementById('productoModal')).hide();
        
        Swal.fire({
            title: '¡Éxito!',
            text: 'Producto agregado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 1500,
            timerProgressBar: true
        });
    });

    // Eventos para cantidad
    decrementQuantityBtn.addEventListener("click", () => {
        if (currentQuantity > 1) currentQuantity--;
        productQuantityInput.value = currentQuantity;
    });
    
    incrementQuantityBtn.addEventListener("click", () => {
        currentQuantity++;
        productQuantityInput.value = currentQuantity;
    });
    
    productQuantityInput.addEventListener("change", (e) => {
        currentQuantity = Math.max(1, parseInt(e.target.value) || 1);
        productQuantityInput.value = currentQuantity;
    });
    
    confirmAddToSidebarBtn.addEventListener("click", () => {
        cantidadModal.hide();
        if (currentProduct) {
            agregarProductoASidebar(currentProduct, currentQuantity);
            currentProduct = null;
            currentQuantity = 1;
            productQuantityInput.value = 1;
            
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Producto agregado al carrito',
                showConfirmButton: false,
                timer: 1500,
                toast: true
            });
        }
    });

    // Funciones principales
    function guardarCategoria(categoria) {
        let categorias = JSON.parse(localStorage.getItem('categorias')) || [];
        categorias.push(categoria);
        localStorage.setItem('categorias', JSON.stringify(categorias));
        actualizarSelectCategorias();
    }

    function guardarProducto(producto) {
        let productos = JSON.parse(localStorage.getItem('productos')) || [];
        productos.push(producto);
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    function cargarCategorias() {
        const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
        categorias.forEach(crearCardCategoria);
        actualizarSelectCategorias();
    }

    function cargarProductos(categoriaId) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        
        // Convertir precios a números
        const productosParseados = productos.map(p => ({
            ...p,
            precio: typeof p.precio === 'string' ? parseFloat(p.precio) : p.precio
        }));
        
        productoContainer.innerHTML = '';
        
        productosParseados.filter(p => p.categoriaId === categoriaId).forEach(producto => {
            crearCardProducto(producto);
        });
    }

    function actualizarSelectCategorias() {
        const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
        categoriaProductoSelect.innerHTML = '<option value="" selected disabled>Seleccione una categoría</option>';
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            categoriaProductoSelect.appendChild(option);
        });
    }

    function crearCardCategoria(categoria) {
        const card = document.createElement("div");
        card.classList.add("categoria-card");
        card.dataset.id = categoria.id;
        card.innerHTML = `
            <h3>${categoria.nombre} <i class="bi bi-box-seam"></i></h3>
        `;
        
        card.addEventListener('click', () => {
            currentCategory = categoria;
            categoriasContainer.style.display = 'none';
            productoContainer.style.display = 'flex';
            btnAgregarProducto.style.display = 'flex';
            
            const backButton = document.createElement('div');
            backButton.classList.add('back-button');
            backButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16" style="margin-right: 5px;">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                </svg>
                Volver a categorías
            `;
            
            backButton.addEventListener('click', (e) => {
                e.stopPropagation();
                volverACategorias();
            });
            
            productoContainer.parentNode.insertBefore(backButton, productoContainer);
            cargarProductos(categoria.id);
        });
        
        // Agregar evento de clic derecho para eliminar
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            eliminarCategoria(categoria.id, card);
        });
        
        categoriasContainer.appendChild(card);
    }

    function volverACategorias() {
        currentCategory = null;
        document.querySelector('.back-button').remove();
        categoriasContainer.style.display = 'flex';
        productoContainer.style.display = 'none';
        btnAgregarProducto.style.display = 'none';
    }

    function crearCardProducto(producto) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.id = producto.id;
        
        // Asegurar que el precio sea número
        const precio = typeof producto.precio === 'string' ? 
                    parseFloat(producto.precio) : 
                    producto.precio;

        card.innerHTML = `
            <img src="${producto.imagenURL}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">Precio: $${precio.toFixed(2)}</p>
                <div class="card-buttons">
                    <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
                    <button class="add-to-sidebar" data-id="${producto.id}">Agregar</button>
                </div>
            </div>
        `;
        
        card.querySelector('.btn-eliminar').addEventListener('click', (e) => {
            e.stopPropagation();
            eliminarProducto(producto.id, card);
        });
        
        card.querySelector('.add-to-sidebar').addEventListener('click', (e) => {
            e.stopPropagation();
            currentProduct = { ...producto, precio: parseFloat(producto.precio) };
            currentQuantity = 1;
            productQuantityInput.value = 1;
            cantidadModal.show();
        });
        
        productoContainer.appendChild(card);
    }

    function eliminarCategoria(id, cardElement) {
        Swal.fire({
            title: '¿Eliminar categoría?',
            text: "Esta acción eliminará la categoría y todos sus productos. ¿Deseas continuar?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                let categorias = JSON.parse(localStorage.getItem('categorias')) || [];
                categorias = categorias.filter(c => c.id !== id);
                localStorage.setItem('categorias', JSON.stringify(categorias));
                
                let productos = JSON.parse(localStorage.getItem('productos')) || [];
                productos = productos.filter(p => p.categoriaId !== id);
                localStorage.setItem('productos', JSON.stringify(productos));
                
                cardElement.remove();
                actualizarSelectCategorias();
                eliminarProductosDeSidebarPorCategoria(id);
                
                Swal.fire({
                    title: '¡Eliminada!',
                    text: 'La categoría y sus productos han sido eliminados.',
                    icon: 'success',
                    timer: 1500,
                    timerProgressBar: true
                });
            }
        });
    }

    function eliminarProducto(id, cardElement) {
        Swal.fire({
            title: '¿Eliminar producto?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                let productos = JSON.parse(localStorage.getItem('productos')) || [];
                productos = productos.filter(p => p.id !== id);
                localStorage.setItem('productos', JSON.stringify(productos));
                cardElement.remove();
                eliminarProductoDeSidebar(id);
                
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El producto ha sido eliminado.',
                    icon: 'success',
                    timer: 1500,
                    timerProgressBar: true
                });
            }
        });
    }

    function agregarProductoASidebar(producto, cantidad) {
        let productosSeleccionados = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];
        const index = productosSeleccionados.findIndex(item => item.producto.id === producto.id);
        
        if (index >= 0) {
            productosSeleccionados[index].cantidad += cantidad;
        } else {
            productosSeleccionados.push({ producto: producto, cantidad: cantidad });
        }
        
        localStorage.setItem('productosSeleccionados', JSON.stringify(productosSeleccionados));
        actualizarSidebar();
    }

    function eliminarProductoDeSidebar(id) {
        let productosSeleccionados = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];
        productosSeleccionados = productosSeleccionados.filter(item => item.producto.id !== id);
        localStorage.setItem('productosSeleccionados', JSON.stringify(productosSeleccionados));
        actualizarSidebar();
    }

    function eliminarProductosDeSidebarPorCategoria(categoriaId) {
        let productosSeleccionados = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];
        productosSeleccionados = productosSeleccionados.filter(item => item.producto.categoriaId !== categoriaId);
        localStorage.setItem('productosSeleccionados', JSON.stringify(productosSeleccionados));
        actualizarSidebar();
    }

    // Inicialización
    cargarCategorias();
});