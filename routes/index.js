var express = require('express');
var router = express.Router();
const { Pool } = require('pg');
const path = require('path');

//configurando la conexion a la base de datoe
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'admin',
  database: 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

/* GET home page. */

router.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/pages/index.html');
});

/* GET productos */

router.get('/productos', (req, res, next) => {
  res.sendFile(__dirname + '/pages/productos.html');
});

/* GET compras */
router.get('/compras', (req, res, next) => {
  res.sendFile(__dirname + '/pages/compras.html');
});

/* GET ventas*/
router.get('/ventas', (req, res, next) => {
  res.sendFile(__dirname + '/pages/ventas.html');
});

/* GET registro */
router.get('/registro', (req, res, next) => {
  res.sendFile(__dirname+'/pages/registro.html');
});

// api
router.get('/api/v1/obtener-productos', (req, res, next) => {
  pool.connect((err, client, release) => {
    if(err){
      return res.json({
        errorMessage: err.stack
      });
    }
    let sql = 'SELECT * FROM producto';
    client.query(sql,(err, result) => {
      release();
      if(err){
        return res.json({
          errorMessage: err.stack
        });
      }
      res.send(result.rows);
    });
  });
});

router.get('/api/v1/obtener-productos/:id', (req, res, next) => {
  let id = req.params.id;
  pool.connect((err, client, release) => {
    if(err){
      return res.json({
        errorMessage: err.stack
      });
    }
    let sql = `SELECT * FROM producto WHERE id_producto = $1`;
    pool.query(sql,[id],(err,result) => {
      if(err){
        res.json({
          errorMessage: err.stack
        });
      }
      res.status(200).send(result.rows[0]);
    });
  });
});

router.get('/api/v1/obtener-productos-bycode/:codigo', (req, res, next) => {
  let codigo = req.params.codigo;
  pool.connect((err, client, release) => {
    if(err){
      return res.json({
        errorMessage: err.stack
      });
    }
    let sql = `SELECT * FROM producto WHERE codigo = $1`;
    pool.query(sql,[codigo],(err,result) => {
      if(err){
        res.json({
          errorMessage: err.stack
        });
      }
      res.status(200).send(result.rows[0]);
    });
  });
});

router.post('/api/v1/agregar-producto', (req, res, next) => {
  pool.connect((err, client, release) => {
    if(err){
      return res.json({
        errorMessage: err.stack
      });
    }
    var sql = `INSERT INTO producto (codigo,nombre, descripcion, existencia) VALUES ($1, $2, $3, $4)`;
    var codigo = req.body.codigo;
    var nombre = req.body.nombre;
    var descipcion = req.body.descripcion;
    var existencia = req.body.existencia;

    client.query(sql,[codigo, nombre, descipcion, existencia],(err, result) => {
      release();
      if(err){
        return res.json({
          errorMessage: err.stack
        });
      }
      res.status(200).send(result);
    });
  });
});

router.post('/api/v1/agregar-compra', (req, res, next) => {
  pool.connect().then((client) => {
    let fecha = req.body.fecha;
    let num_compra = req.body.num_compra;
    let proveedor = req.body.proveedor;
    console.log(fecha,num_compra,proveedor);
    let sql = 'INSERT INTO compra(num_compra,fecha,proveedor) VALUES($1, $2, $3);'; 
    client.query(sql,[num_compra,fecha,proveedor]).then((result) => {
      return client.query('SELECT id_compra FROM compra ORDER BY id_compra DESC LIMIT 1;');
    }).then((result) => {
      let id_compra = result.rows[0].id_compra;
      let lineasDeCompra = JSON.parse(req.body.lineasDeCompraStr);
      let sql = 'INSERT INTO linea_de_compra (id_compra, id_producto, cantidad, precio_unitario) VALUES ';
      let values = [];
      for(let i = 1; i <= lineasDeCompra.length; i++){
        sql += `($${4*i-3},$${4*i -2},$${4*i-1},$${4*i}),`;
        values.push(id_compra);
        values.push(lineasDeCompra[i-1].id_producto);
        values.push(lineasDeCompra[i-1].cantidad);
        values.push(lineasDeCompra[i-1].precio_unitario);
      }
      sql = sql.substring(0, sql.length-1);
      sql += ';'
      console.log(lineasDeCompra);
      console.log('sql: ',sql);
      console.log('values: ',values);
      console.log('lenght: ',lineasDeCompra.length);
      return client.query(sql,values);
    }).then((result) => {
      return client.query('SELECT id_compra FROM compra ORDER BY id_compra DESC LIMIT 1;');
    }).then((result) => {
      let sql = 'SELECT p.id_producto,p.nombre,p.descripcion,p.existencia,p.codigo,c.cantidad FROM producto p JOIN linea_de_compra c ON p.id_producto = c.id_producto WHERE c.id_compra = $1';
      let id_compra = result.rows[0].id_compra;
      return client.query(sql,[id_compra]);
    }).then((result) => {
      let valuesArray = [];
      let valuesStr = '';
      let sql = ``;
      // llenando el arreglo de los valores
      for(let i = 0; i <result.rows.length; i++){
        let row = {
          id_producto: result.rows[i].id_producto,
          nombre: result.rows[i].nombre,
          descripcion: result.rows[i].descripcion,
          existencia: result.rows[i].existencia + result.rows[i].cantidad,
          codigo: result.rows[i].codigo
        };
        valuesArray.push(row.id_producto);
        valuesArray.push(row.nombre);
        valuesArray.push(row.descripcion);
        valuesArray.push(row.existencia);
        valuesArray.push(row.codigo);
        valuesStr += `($${(i+1)*5-4},$${(i+1)*5-3},$${(i+1)*5-2},$${(i+1)*5-1},$${(i+1)*5}),`;
      }
      valuesStr = valuesStr.substring(0,valuesStr.length-1);
      sql += `INSERT INTO producto (id_producto,nombre,descripcion,existencia,codigo) `;
      sql += `VALUES ${valuesStr} `;
      sql += `ON CONFLICT (id_producto) DO UPDATE SET `;
      sql += `nombre=excluded.nombre, descripcion=excluded.descripcion,existencia=excluded.existencia,codigo=excluded.codigo;`;
      console.log(sql);
      return client.query(sql,valuesArray);
    })
    .then((result) => {
      client.release();
      res.json({
        message: 'Compra guardada exitosamente. Catálogo de productos actualizado'
      });
    })
    .catch((err) => {
      client.release();
      console.error('query error', err.message, err.stack);
      res.json({
        message: 'query error' +'\n'+ err.message + '\n' +  err.stack
      });
    });
  });
});

router.post('/api/v1/agregar-venta', (req, res, next) => {
  pool.connect().then((client) => {
    let fecha = req.body.fecha;
    let num_venta = req.body.num_venta;
    let cliente = req.body.cliente;
    console.log(fecha,num_venta,cliente);
    let sql = 'INSERT INTO venta(num_venta,fecha,cliente) VALUES($1, $2, $3);'; 
    client.query(sql,[num_venta,fecha,cliente]).then((result) => {
      return client.query('SELECT id_venta FROM venta ORDER BY id_venta DESC LIMIT 1;');
    }).then((result) => {
      let id_venta = result.rows[0].id_venta;
      console.log('Lineas de venta\n',req.body.lineasDeVentaStr);
      let lineasDeVenta = JSON.parse(req.body.lineasDeVentaStr);
      let sql = 'INSERT INTO linea_de_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES ';
      let values = [];
      for(let i = 1; i <= lineasDeVenta.length; i++){
        sql += `($${4*i-3},$${4*i -2},$${4*i-1},$${4*i}),`;
        values.push(id_venta);
        values.push(lineasDeVenta[i-1].id_producto);
        values.push(lineasDeVenta[i-1].cantidad);
        values.push(lineasDeVenta[i-1].precio_unitario);
      }
      sql = sql.substring(0, sql.length-1);
      sql += ';'
      console.log(lineasDeVenta);
      console.log('sql: ',sql);
      console.log('values: ',values);
      console.log('lenght: ',lineasDeVenta.length);
      return client.query(sql,values);
    }).then((result) => {
      return client.query('SELECT id_venta FROM venta ORDER BY id_venta DESC LIMIT 1;');
    }).then((result) => {
      let sql = 'SELECT p.id_producto,p.nombre,p.descripcion,p.existencia,p.codigo,c.cantidad FROM producto p JOIN linea_de_venta c ON p.id_producto = c.id_producto WHERE c.id_venta = $1';
      let id_venta = result.rows[0].id_venta;
      return client.query(sql,[id_venta]);
    }).then((result) => {
      let valuesArray = [];
      let valuesStr = '';
      let sql = ``;
      // llenando el arreglo de los valores
      for(let i = 0; i <result.rows.length; i++){
        let row = {
          id_producto: result.rows[i].id_producto,
          nombre: result.rows[i].nombre,
          descripcion: result.rows[i].descripcion,
          existencia: result.rows[i].existencia - result.rows[i].cantidad,
          codigo: result.rows[i].codigo
        };
        valuesArray.push(row.id_producto);
        valuesArray.push(row.nombre);
        valuesArray.push(row.descripcion);
        valuesArray.push(row.existencia);
        valuesArray.push(row.codigo);
        valuesStr += `($${(i+1)*5-4},$${(i+1)*5-3},$${(i+1)*5-2},$${(i+1)*5-1},$${(i+1)*5}),`;
      }
      valuesStr = valuesStr.substring(0,valuesStr.length-1);
      sql += `INSERT INTO producto (id_producto,nombre,descripcion,existencia,codigo) `;
      sql += `VALUES ${valuesStr} `;
      sql += `ON CONFLICT (id_producto) DO UPDATE SET `;
      sql += `nombre=excluded.nombre, descripcion=excluded.descripcion,existencia=excluded.existencia,codigo=excluded.codigo;`;
      console.log(sql);
      return client.query(sql,valuesArray);
    })
    .then((result) => {
      client.release();
      res.json({
        message: 'Venta guardada exitosamente. Catálogo de productos actualizado'
      });
    })
    .catch((err) => {
      client.release();
      console.error('query error', err.message, err.stack);
      res.json({
        message: 'query error' +'\n'+ err.message + '\n' +  err.stack
      });
    });
  });
});

router.get('/api/v1/obtener-compras',(req, res, next) => {
  pool.connect().then((client)=>{
    let sql = 'SELECT * FROM compra';
    client.query(sql).then((result) => {
      client.release();
      res.json(result.rows);
    });
  }).catch((e)=>{
    client.release();
    res.json({
      message: e.stack()
    });
  });
});

router.get('/api/v1/obtener-lineas-de-compra',(req, res, next) => {
  pool.connect().then((client)=>{
    let sql = 'SELECT * FROM linea_de_compra l JOIN producto p ON ';
    sql += 'l.id_producto = p.id_producto;';
    client.query(sql).then((result) => {
      client.release();
      res.json(result.rows);
    });
  }).catch((e)=>{
    client.release();
    res.json({
      message: e.stack()
    });
  });
});

router.get('/api/v1/obtener-ventas',(req, res, next) => {
  pool.connect().then((client)=>{
    let sql = 'SELECT * FROM venta';
    client.query(sql).then((result) => {
      client.release();
      res.json(result.rows);
    });
  }).catch((e)=>{
    client.release();
    res.json({
      message: e.stack()
    });
  });
});

router.get('/api/v1/obtener-lineas-de-venta',(req, res, next) => {
  pool.connect().then((client)=>{
    let sql = 'SELECT * FROM linea_de_venta l JOIN producto p ON ';
    sql += 'l.id_producto = p.id_producto;';
    client.query(sql).then((result) => {
      client.release();
      res.json(result.rows);
    });
  }).catch((e)=>{
    client.release();
    res.json({
      message: e.stack()
    });
  });
});

module.exports = router;
