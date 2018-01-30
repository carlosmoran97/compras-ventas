var cabecera 
= `<thead>
        <tr>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Descripcion</th>
            <th>Existencia</th>
        </tr>
    </thead>`;
var llenarTablaProductos = () => {
    vaciarFormulario();
    axios.get('/api/v1/obtener-productos').then((response) =>{
        let array = response.data;
        let length = array.length;
        let table = document.getElementById('tabla-productos');
        let html = cabecera;
        for(let i = 0; i < length; i++){
            html += `<tr>
                        <td>${array[i].codigo}</td>
                        <td>${array[i].nombre}</td>
                        <td>${array[i].descripcion}</td>
                        <td>${array[i].existencia}</td>
                    </tr>
            `;
        }
        table.innerHTML = html;
    }).catch((error) => {
        console.log(error);
    });
};

var guardarProducto = () => {
    let codigo = document.getElementById('codigo').value;
    let nombre = document.getElementById('nombre').value;
    let descripcion = document.getElementById('descripcion').value;
    let existencia = document.getElementById('existencia').value;

    axios.post('/api/v1/agregar-producto', {
        codigo,
        nombre,
        descripcion,
        existencia
    }).then((response) => {
        if(response.data.errorMessage){
            return alert(response.data.errorMessage);
        }
        llenarTablaProductos();
    }).catch((err) => {
        console.log(error);
    });
};

var vaciarFormulario = () =>{
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('existencia').value = '';
};