var lineasDeCompra = [];
var cabecera = `<thead>
<tr>
    <th>Cantidad</th>
    <th>Concepto</th>
    <th>Precio unitario</th>
    <th>Total de linea</th>
</tr>
</thead>`;

var abrirEnPestana = (url) => {
    window.open(url);
};

var agregarLineaDeCompra = () => {
    let codigo = document.getElementById('codigo').value;
    let lineaDeCompra = {
        cantidad: document.getElementById('cantidad').value,
        id_producto: '',
        id_compra: '',
        concepto: '',
        precio_unitario: document.getElementById('precio_unitario').value,
        totalDeLinea: 0
    };
    try{
        if(lineaDeCompra.cantidad <= 0 || lineaDeCompra.precio_unitario <= 0){
            throw new Error('No puede introducir valores menores o iguales a cero (0).');
        }
        let cantidad = parseInt(document.getElementById('cantidad').value);
        let precio = parseFloat(document.getElementById('precio_unitario').value);
        if(isNaN(cantidad) || isNaN(precio)){
            throw new Error('Debe de introducir un valor numérico.');
        }
        lineaDeCompra.totalDeLinea = lineaDeCompra.cantidad * lineaDeCompra.precio_unitario;
    }
    catch(err){
        document.getElementById('cantidad').value = 1;
        document.getElementById('precio_unitario').value = 1;
        return alert(err.message);
    }
    axios.get(`/api/v1/obtener-productos-bycode/${codigo}`).then((response) => {
        if(response.data.length === 0){
            return alert(`No se pudo obtener el producto con código ${codigo}.\nVerifique que se encuentre en su lista de productos e inténtelo nuevamente.`);
        }
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            minimumIntegerDigits: 1,
            maximumFractionDigits: 2
          });
        lineaDeCompra.concepto = response.data.nombre;
        lineaDeCompra.id_producto = response.data.id_producto;
        // agregando al arreglo
        lineasDeCompra.push( lineaDeCompra );
        // agregando a la tabla
        let html = cabecera;
        let tabla = document.getElementById('tabla-lineas-de-compras');
        for(let i = 0; i < lineasDeCompra.length; i++){
            html += `<tr>
                        <td>${lineasDeCompra[i].cantidad}</td>
                        <td>${lineasDeCompra[i].concepto}</td>
                        <td>${formatter.format(lineasDeCompra[i].precio_unitario)}</td>
                        <td>${formatter.format(lineasDeCompra[i].totalDeLinea)}</td>
                     </tr>`;
        }
        tabla.innerHTML = html;
    }).catch((err) => {
        alert(err);
    });
};

var guardarCompra = () => {
    let fecha = document.getElementById('fecha');
    let num_compra = document.getElementById('num_compra');
    let proveedor = document.getElementById('proveedor');
    try{
        if(fecha.value == ""){
            fecha.focus();
            throw new Error('Debe ingresar una fecha válida');
        }
        if(num_compra.value == ""){
            num_compra.focus();
            throw new Error('Debe de ingresar el número del documento.');
        }
        if(lineasDeCompra.length === 0){
            throw new Error('Debe agregar al menos una linea de compra');
        }
        let lineasDeCompraStr = JSON.stringify(lineasDeCompra);
        axios.post('/api/v1/agregar-compra',{
            num_compra: num_compra.value,
            fecha: fecha.value,
            proveedor: proveedor.value,
            lineasDeCompraStr
        }).then((response) => {
            alert(response.data.message);
            limpiarFormulario();
        }).catch((err) => {
            alert(err);
        });
    }
    catch(err){
        return alert(err.message);
    }
};

var limpiarFormulario = () => {
    let num_compra = document.getElementById('num_compra');
    let proveedor = document.getElementById('proveedor');
    let cantidad = document.getElementById('cantidad');
    let codigo = document.getElementById('codigo');
    let precio_unitario = document.getElementById('precio_unitario');
    let tabla = document.getElementById('tabla-lineas-de-compras');

    num_compra.value = '';
    proveedor.value = '';
    cantidad.value = 1;
    codigo.value = '';
    precio_unitario.value = '';
    tabla.innerHTML = cabecera;

    let lineasDeCompra = [];
    lineasDeCompra.length = 0;
};