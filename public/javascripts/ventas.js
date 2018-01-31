var lineasDeVenta = [];
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

var agregarLineaDeVenta = () => {
    let codigo = document.getElementById('codigo').value;
    let lineaDeVenta = {
        cantidad: document.getElementById('cantidad').value,
        id_producto: '',
        id_venta: '',
        concepto: '',
        precio_unitario: document.getElementById('precio_unitario').value,
        totalDeLinea: 0
    };
    try{
        if(lineaDeVenta.cantidad <= 0 || lineaDeVenta.precio_unitario <= 0){
            throw new Error('No puede introducir valores menores o iguales a cero (0).');
        }
        let cantidad = parseInt(document.getElementById('cantidad').value);
        let precio = parseFloat(document.getElementById('precio_unitario').value);
        if(isNaN(cantidad) || isNaN(precio)){
            throw new Error('Debe de introducir un valor numérico.');
        }
        lineaDeVenta.totalDeLinea = lineaDeVenta.cantidad * lineaDeVenta.precio_unitario;
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
        lineaDeVenta.concepto = response.data.nombre;
        lineaDeVenta.id_producto = response.data.id_producto;
        // agregando al arreglo
        lineasDeVenta.push( lineaDeVenta );
        // agregando a la tabla
        let html = cabecera;
        let tabla = document.getElementById('tabla-lineas-de-venta');
        for(let i = 0; i < lineasDeVenta.length; i++){
            html += `<tr>
                        <td>${lineasDeVenta[i].cantidad}</td>
                        <td>${lineasDeVenta[i].concepto}</td>
                        <td>${formatter.format(lineasDeVenta[i].precio_unitario)}</td>
                        <td>${formatter.format(lineasDeVenta[i].totalDeLinea)}</td>
                     </tr>`;
        }
        tabla.innerHTML = html;
        document.getElementById('cantidad').value = 1;
        document.getElementById('precio_unitario').value = '';
        document.getElementById('codigo').value = '';
    }).catch((err) => {
        alert(err);
    });
};

var guardarVenta = () => {
    let fecha = document.getElementById('fecha');
    let num_venta = document.getElementById('num_venta');
    let cliente = document.getElementById('cliente');
    try{
        if(fecha.value == ""){
            fecha.focus();
            throw new Error('Debe ingresar una fecha válida');
        }
        if(num_venta.value == ""){
            num_venta.focus();
            throw new Error('Debe de ingresar el número del documento.');
        }
        if(lineasDeVenta.length === 0){
            throw new Error('Debe agregar al menos una linea de venta');
        }
        let lineasDeVentaStr = JSON.stringify(lineasDeVenta);
        axios.post('/api/v1/agregar-venta',{
            num_venta: num_venta.value,
            fecha: fecha.value,
            cliente: cliente.value,
            lineasDeVentaStr
        }).then((response) => {
            limpiarFormulario();
            alert(response.data.message);
        }).catch((err) => {
            alert(err);
        });
    }
    catch(err){
        return alert(err.message);
    }
};

var limpiarFormulario = () => {
    let num_venta = document.getElementById('num_venta');
    let cliente = document.getElementById('cliente');
    let cantidad = document.getElementById('cantidad');
    let codigo = document.getElementById('codigo');
    let precio_unitario = document.getElementById('precio_unitario');
    let tabla = document.getElementById('tabla-lineas-de-venta');

    num_venta.value = '';
    cliente.value = '';
    cantidad.value = 1;
    codigo.value = '';
    precio_unitario.value = '';
    tabla.innerHTML = cabecera;

    lineasDeVenta = [];
    lineasDeVenta.length = 0;
};