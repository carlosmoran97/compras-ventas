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
    var sql = 'SELECT * FROM producto';
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

router.post('/api/v1/agregar-producto', (req, res, next) => {
  pool.connect((err, client, release) => {
    if(err){
      return res.json({
        errorMessage: err.stack
      });
    }
    var sql = `INSERT INTO producto (codigo,nombre, descripcion, precio_unitario, existencia) VALUES ($1, $2, $3, $4, $5)`;
    var codigo = req.body.codigo;
    var nombre = req.body.nombre;
    var descipcion = req.body.descripcion;
    var precio_unitario = req.body.precio_unitario;
    var existencia = req.body.existencia;

    client.query(sql,[codigo, nombre, descipcion, precio_unitario, existencia],(err, result) => {
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

module.exports = router;
