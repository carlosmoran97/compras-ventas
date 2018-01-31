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
      client.release();
      res.json({
        message: 'Compra guardada correctamente'
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

module.exports = router;
