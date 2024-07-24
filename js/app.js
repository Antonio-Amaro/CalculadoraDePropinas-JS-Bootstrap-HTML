let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

const categories = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postre'
}

const btnSaveClient = document.querySelector('#guardar-cliente');
btnSaveClient.addEventListener('click', saveClient);

function saveClient() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Validar que no haya campos vacíos
    const emptyFields = [ mesa, hora ].some( field => field === '');

    if( emptyFields ) {

        // Comprobar si existe una alerta
        const alertExists = document.querySelector('.invalid-feedback');

        // Si no existe, crear alerta
        if( !alertExists ) {
            const alertError = document.createElement('DIV');
            alertError.classList.add('invalid-feedback', 'd-block', 'text-center');
            alertError.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alertError);

            setTimeout(() => {
                alertError.remove();
            }, 2000);
        }

        return;
    }
    
    cliente = { ...cliente, mesa, hora }

    const modalForm = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
    modalBootstrap.hide();

    // Mostrar secciones de platillos y orden
    showSections();

    // Obtener platillos de la API
    getDishes();
}

function showSections() {
    const hiddenSections = document.querySelectorAll('.d-none');
    hiddenSections.forEach( section => section.classList.remove('d-none') );
}

function getDishes() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then( response => response.json() )
        .then( data => showDishes(data) ) // Mostrar datos en el html
        .catch( error => console.log( error ) )
}

function showDishes(dishes) {
    const content = document.querySelector('#platillos .contenido')

    dishes.forEach( dish => {

        const { categoria, id, nombre, precio } = dish;

        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const dishTitle = document.createElement('DIV');
        dishTitle.classList.add('col-md-4');
        dishTitle.textContent = nombre;

        const dishPrice = document.createElement('DIV');
        dishPrice.classList.add('col-md-3', 'fw-bold');
        dishPrice.textContent = `$${precio}`;

        const dishCategory = document.createElement('DIV');
        dishCategory.classList.add('col-md-3');
        dishCategory.textContent = categories[categoria];

        const inputQuantity = document.createElement('INPUT');
        inputQuantity.type = 'number';
        inputQuantity.min = 0;
        inputQuantity.id = `product-${id}`;
        inputQuantity.value = 0;
        inputQuantity.classList.add('form-control');

        // Detectando cantidad y platillo que se agrega
        inputQuantity.onchange = () => {
            const quantity = parseInt(inputQuantity.value);
            addDish( {...dish, quantity} )
        };

        const dishQuantity = document.createElement('DIV');
        dishQuantity.classList.add('col-md-2');
        dishQuantity.appendChild(inputQuantity);

        row.appendChild(dishTitle);
        row.appendChild(dishPrice);
        row.appendChild(dishCategory);
        row.appendChild(dishQuantity);

        content.appendChild(row);

    })
}

function addDish(dish) {
    
    // Verificar si la cantidad del platillo es mayor a 0
    if( dish.quantity > 0 ) {

        // Verificar si el platillo ya existe en el arreglo de pedidos para evitar repetidos
        if( cliente.pedido.some( pedidoItem => pedidoItem.id === dish.id ) ) {

            // Mapeamos el arreglo para encontrar el platillo que ya existe en el pedido
            const pedidoActualizado = cliente.pedido.map( pedidoItem => {

                // El platillo existente se le actualiza la cantidad
                if( pedidoItem.id === dish.id ) {
                    pedidoItem.quantity = dish.quantity;
                }
                // Le pasamos los platillos al arreglo
                return pedidoItem;
            
            });

            // Le asignamos el nuevo arreglo al pedido
            cliente.pedido = [...pedidoActualizado];

        } else { // Si no existe el platillo en el pedido, lo agregamos al arreglo
            cliente.pedido = [...cliente.pedido, dish]
        }

    } else { // En caso de que la cantidad sea 0, pasar solo los platillos que tengan una cantidad mayor a 0
        const activeOrder = cliente.pedido.filter( pedidoItem => pedidoItem.id !== dish.id );
        cliente.pedido = [...activeOrder];
    }

    cleanHTML();

    // mostrar mensaje condicionalmente
    if( cliente.pedido.length ) {
        showOrder();
    } else {
        messageEmpty();
    }

}

function showOrder() {

    const content = document.querySelector('#resumen .contenido');
    
    const summary = document.createElement('DIV');
    summary.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');
    
    const table = document.createElement('P');
    table.textContent = 'Mesa: ';
    table.classList.add('fw-bold');

    const tableSpan = document.createElement('SPAN');
    tableSpan.textContent = cliente.mesa;
    tableSpan.classList.add('fw-normal');

    const time = document.createElement('P');
    time.textContent = 'Hora: ';
    time.classList.add('fw-bold');

    const timeSpan = document.createElement('SPAN');
    timeSpan.textContent = cliente.hora;
    timeSpan.classList.add('fw-normal');
    
    table.appendChild(tableSpan);
    time.appendChild(timeSpan);

    const heading = document.createElement('H3');
    heading.textContent = "Platillos Consumidos";
    heading.classList.add('my-4');

    const group = document.createElement('UL');
    group.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( pedidoItem => {
        
        const { nombre, quantity, precio, id } = pedidoItem;

        const list = document.createElement('LI');
        list.classList.add('list-group-item');

        const nameItem = document.createElement('H4');
        nameItem.classList.add('my-4');
        nameItem.textContent = nombre;

        const quantityItem = document.createElement('P');
        quantityItem.classList.add('fw-bold');
        quantityItem.textContent = 'Cantidad: ';

        const quantityValue = document.createElement('SPAN');
        quantityValue.classList.add('fw-normal');
        quantityValue.textContent = quantity;

        const priceItem = document.createElement('P');
        priceItem.classList.add('fw-bold');
        priceItem.textContent = 'Precio: ';

        const priceValue = document.createElement('SPAN');
        priceValue.classList.add('fw-normal');
        priceValue.textContent = `$${precio}`;

        const subtotalItem = document.createElement('P');
        subtotalItem.classList.add('fw-bold');
        subtotalItem.textContent = 'Subtotal: ';

        const subtotalValue = document.createElement('SPAN');
        subtotalValue.classList.add('fw-normal');
        subtotalValue.textContent = calculateSubtotal( precio, quantity );

        const deleteBtn = document.createElement('BUTTON');
        deleteBtn.classList.add('btn', 'btn-danger');
        deleteBtn.textContent = 'Eliminar Platillo';
        deleteBtn.onclick = function() {
            deleteDish(id);
        }

        quantityItem.appendChild(quantityValue);
        priceItem.appendChild(priceValue);
        subtotalItem.appendChild(subtotalValue);

        list.appendChild(nameItem);
        list.appendChild(quantityItem);
        list.appendChild(priceItem);
        list.appendChild(subtotalItem);
        list.appendChild(deleteBtn);

        group.appendChild(list);
    })

    summary.appendChild(heading);
    summary.appendChild(table);
    summary.appendChild(time);
    summary.appendChild(group);

    content.appendChild(summary);

    // Formulario de propinas
    tipForm();

}

function calculateSubtotal( precio, cantidad ) {
    return `$${ precio * cantidad }`;
}

function deleteDish(id) {

    const activeOrder = cliente.pedido.filter( pedidoItem => pedidoItem.id !== id );
    cliente.pedido = [...activeOrder];

    cleanHTML();

    if( cliente.pedido.length ) {
        showOrder();
    } else {
        messageEmpty();
    }

    const productInput = document.querySelector(`#product-${id}`);
    productInput.value = 0;
}

function messageEmpty() {
    const content = document.querySelector('#resumen .contenido');

    const text = document.createElement('P');
    text.classList.add('text-center');
    text.textContent = 'Añade los elementos del pedido';

    content.appendChild(text);
}

function cleanHTML() {
    const content = document.querySelector('#resumen .contenido');

    while( content.firstChild ) {
        content.removeChild(content.firstChild);
    }
}

function tipForm() {

    const content = document.querySelector('#resumen .contenido');
    
    const divForm = document.createElement('DIV');
    divForm.classList.add('col-md-6', 'formulario');

    const form = document.createElement('DIV');
    form.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4');
    heading.textContent = 'Propina';

    // Radio input 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10'
    radio10.classList.add('form-check-input');
    radio10.onclick = function() {
        estimateTip()
    }

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // Radio input 15%
    const radio15 = document.createElement('INPUT');
    radio15.type = 'radio';
    radio15.name = 'propina';
    radio15.value = '15'
    radio15.classList.add('form-check-input');
    radio15.onclick = function() {
        estimateTip()
    }

    const radio15Label = document.createElement('LABEL');
    radio15Label.textContent = '15%';
    radio15Label.classList.add('form-check-label');

    const radio15Div = document.createElement('DIV');
    radio15Div.classList.add('form-check');

    radio15Div.appendChild(radio15);
    radio15Div.appendChild(radio15Label);

    // Radio input 20%
    const radio20 = document.createElement('INPUT');
    radio20.type = 'radio';
    radio20.name = 'propina';
    radio20.value = '20'
    radio20.classList.add('form-check-input');
    radio20.onclick = function() {
        estimateTip()
    }

    const radio20Label = document.createElement('LABEL');
    radio20Label.textContent = '20%';
    radio20Label.classList.add('form-check-label');

    const radio20Div = document.createElement('DIV');
    radio20Div.classList.add('form-check');

    radio20Div.appendChild(radio20);
    radio20Div.appendChild(radio20Label);

    form.appendChild(heading);
    form.appendChild(radio10Div);
    form.appendChild(radio15Div);
    form.appendChild(radio20Div);

    divForm.appendChild(form);

    content.appendChild(divForm);
}

function estimateTip() {
    
    const { pedido } = cliente;
    let subtotal = 0;

    pedido.forEach( pedidoItem => {
        subtotal += pedidoItem.quantity * pedidoItem.precio;
    })

    const tipSelected = document.querySelector('[name="propina"]:checked').value;
    
    const tip = (subtotal * parseInt(tipSelected)) / 100;
    
    const total = subtotal + tip;

    showOrderTotal(tip, subtotal, total);
}

function showOrderTotal(tip, subtotal, total) {

    const divTotals = document.createElement('DIV');
    divTotals.classList.add('total-pagar', 'mb-2')

    // Subtotal
    const subtotalParagraph = document.createElement('P');
    subtotalParagraph.classList.add('fs-4', 'fw-bold', 'mt-5');
    subtotalParagraph.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParagraph.appendChild(subtotalSpan);

    // Tip
    const tipParagraph = document.createElement('P');
    tipParagraph.classList.add('fs-4', 'fw-bold', 'mt-3');
    tipParagraph.textContent = 'Propina: ';

    const tipSpan = document.createElement('SPAN');
    tipSpan.classList.add('fw-normal');
    tipSpan.textContent = `$${tip}`;

    tipParagraph.appendChild(tipSpan);

    // Total
    const totalParagraph = document.createElement('P');
    totalParagraph.classList.add('fs-4', 'fw-bold', 'mt-3');
    totalParagraph.textContent = 'Total a pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParagraph.appendChild(totalSpan);

    // Eliminar resultado anterior
    const divTotalsContainer = document.querySelector('.total-pagar');
    if(divTotalsContainer) {
        divTotalsContainer.remove();
    }


    divTotals.appendChild(subtotalParagraph);
    divTotals.appendChild(tipParagraph);
    divTotals.appendChild(totalParagraph);

    const form = document.querySelector('.formulario > div');
    form.appendChild(divTotals);
}