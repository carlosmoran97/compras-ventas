var compras = [];
var lineasDeCompra = [];
var ventas = [];
var lineasDeVenta = [];
const headerVenta = `<thead>
                    <tr>
                        <th>Id</th>
                        <th>Fecha</th>
                        <th>No. de documento</th>
                        <th>Cliente</th>
                        <th>Total</th>
                    </tr>
                </thead>`;
const headerCompra = `<thead>
                    <tr>
                        <th>Id</th>
                        <th>Fecha</th>
                        <th>No. de documento</th>
                        <th>Proveedor</th>
                        <th>Total</th>
                    </tr>
                </thead>`;

var obtenerDatos = () => {
    document.getElementById('año').value = new Date().getFullYear();
    document.getElementById('tabla-registro').innerHTML = headerVenta;
    axios.get('/api/v1/obtener-compras').then((response) => {
        compras = response.data;
        return axios.get('/api/v1/obtener-lineas-de-compra');
    })
    .then((response) => {
        lineasDeCompra = response.data;
        return axios.get('/api/v1/obtener-ventas');
    })
    .then((response) => {
        ventas = response.data;
        return axios.get('/api/v1/obtener-lineas-de-venta');
    })
    .then((response) => {
        lineasDeVenta = response.data;
    })
    .catch((e) => {
        alert(e.stack);
    });
};

var calcularTotalVenta = (venta) => {
    let total = 0;
    for(let i = 0; i < lineasDeVenta.length; i++){
        if(venta.id_venta === lineasDeVenta[i].id_venta){
            total += lineasDeVenta[i].cantidad*lineasDeVenta[i].precio_unitario;
        }
    }
    return total;
};

var calcularTotalCompra = (compra) => {
    let total = 0;
    for(let i = 0; i < lineasDeCompra.length; i++){
        if(compra.id_compra == lineasDeCompra[i].id_compra){
            total += lineasDeCompra[i].cantidad*lineasDeCompra[i].precio_unitario;
        }
    }
    return total;
};

var filtrar = () => {
    var nf = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        minimumIntegerDigits: 1
      });
    let movimiento = document.getElementById('movimiento').value;
    let mes = document.getElementById('mes').value;
    let año = document.getElementById('año').value;
    let tabla = document.getElementById('tabla-registro');
    let html = '';
    let totalMes = 0;
    switch(movimiento){
        case 'compras':
            tabla.innerHTML = headerCompra;
            for(let i = 0; i < compras.length; i++){
                let fecha  = new Date(compras[i].fecha);
                let fechaStr = `${dayFormat(fecha.getUTCDay())}-${numToMonth(fecha.getUTCMonth())}-${fecha.getUTCFullYear()}`;
                if(fecha.getUTCMonth()==mes && fecha.getUTCFullYear()==año){
                    let total = calcularTotalCompra(compras[i]);
                    html += `<tr data-toggle="collapse" data-target=".collapseRow${i}" aria-expanded="false" aria-controls="collapseRow${i}">
                                <td>${compras[i].id_compra}</td>
                                <td>${fechaStr}</td>
                                <td>${compras[i].num_compra}</td>
                                <td>${compras[i].proveedor?compras[i].proveedor:'anónimo'}</td>
                                <td>${nf.format(total)}</td>
                            </tr>`;
                    for(let k =0;k <lineasDeCompra.length;k++){
                        if(lineasDeCompra[k].id_compra==compras[i].id_compra){
                            html += `<tr bgcolor="#e6e6ff" class="collapse collapseRow${i}">
                                        <td></td>
                                        <td>${lineasDeCompra[k].cantidad}</td>
                                        <td>${lineasDeCompra[k].nombre}</td>
                                        <td>${nf.format(lineasDeCompra[k].precio_unitario)}</td>
                                        <td>${nf.format(lineasDeCompra[k].precio_unitario*lineasDeCompra[k].cantidad)}</td>
                                     </tr>`;
                        }
                    }
                    totalMes += total;
                }
            }
            tabla.innerHTML += html;
            document.getElementById('total-mes').innerHTML = nf.format(totalMes);
        break;
        case 'ventas':
        tabla.innerHTML = headerVenta;
            for(let i = 0; i < ventas.length; i++){
                let fecha  = new Date(ventas[i].fecha);
                let fechaStr = `${dayFormat(fecha.getUTCDay())}-${numToMonth(fecha.getUTCMonth())}-${fecha.getUTCFullYear()}`;
                if(fecha.getUTCMonth()==mes && fecha.getUTCFullYear()==año){
                    let total = calcularTotalVenta(ventas[i]);
                    html += `<tr data-toggle="collapse" data-target=".collapseRow${i}" aria-expanded="false" aria-controls="collapseRow${i}">
                    
                                <td>${ventas[i].id_venta}</td>
                                <td>${fechaStr}</td>
                                <td>${ventas[i].num_venta}</td>
                                <td>${ventas[i].proveedor?ventas[i].proveedor:'anónimo'}</td>
                                <td>${nf.format(total)}</td>
                            </tr>`;
                            for(let k =0;k <lineasDeVenta.length;k++){
                                if(lineasDeVenta[k].id_venta==ventas[i].id_venta){
                                    html += `<tr bgcolor="#e6e6ff" class="collapse collapseRow${i}">
                                                <td></td>
                                                <td>${lineasDeVenta[k].cantidad}</td>
                                                <td>${lineasDeVenta[k].nombre}</td>
                                                <td>${nf.format(lineasDeVenta[k].precio_unitario)}</td>
                                                <td>${nf.format(lineasDeVenta[k].precio_unitario*lineasDeVenta[k].cantidad)}</td>
                                             </tr>`;
                                }
                            }
                    totalMes += total;
                }
            }
            tabla.innerHTML += html;
            document.getElementById('total-mes').innerHTML = nf.format(totalMes);
        break;
    }
};

var numToMonth = num =>  {
    let month = '';
    switch(num){
        case 0:
            month = 'ene.'
        break;
        case 1:
            month = 'feb.'
        break;
        case 2:
            month = 'mar.'
        break;
        case 3:
            month = 'abr.'
        break;
        case 4:
            month = 'may.'
        break;
        case 5:
            month = 'jun.'
        break;
        case 6:
            month = 'jul.'
        break;
        case 7:
            month = 'ago.'
        break;
        case 8:
            month = 'sep.'
        break;
        case 9:
            month = 'oct.'
        break;
        case 10:
            month = 'nov.'
        break;
        case 11:
            month = 'dic.'
        break;
    }
    return month;
};

var dayFormat = (day) => 
{
    if(day < 10){
        return '0' + day.toString();
    }
    return day;
};