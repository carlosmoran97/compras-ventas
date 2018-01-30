const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'admin',
    database: 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

pool.connect((err, client, release) => {
    if(err){
        return console.error('Error acquiring client', err.stack);
    }
    const sql = `CREATE TABLE producto(
                    id_producto SERIAL PRIMARY KEY,
                    codigo VARCHAR(10) NOT NULL,
                    nombre VARCHAR(100) NOT NULL,
                    descripcion VARCHAR(255) NOT NULL,
                    precio_unitario NUMERIC NOT NULL,
                    existencia INTEGER NOT NULL
                );
                
                CREATE TABLE compra
                (
                    id_compra SERIAL PRIMARY KEY,
                    num_compra VARCHAR(40) NOT NULL,
                    fecha DATE NOT NULL,
                    proveedor VARCHAR(40)
                );
                
                CREATE TABLE linea_de_compra(
                    id_linea_de_compra SERIAL PRIMARY KEY,
                    id_compra INTEGER,
                    id_producto INTEGER NOT NULL,
                    cantidad INTEGER NOT NULL
                );
                
                ALTER TABLE linea_de_compra 
                ADD CONSTRAINT fk_linea_de_compra
                FOREIGN KEY(id_compra)
                REFERENCES compra(id_compra);
                
                CREATE TABLE venta
                (
                    id_venta SERIAL PRIMARY KEY,
                    num_venta VARCHAR(40) NOT NULL,
                    fecha DATE NOT NULL,
                    cliente VARCHAR(40)
                );
                
                CREATE TABLE linea_de_venta(
                    id_linea_de_venta SERIAL PRIMARY KEY,
                    id_venta INTEGER,
                    id_producto INTEGER NOT NULL,
                    cantidad INTEGER NOT NULL
                );
                
                ALTER TABLE linea_de_venta 
                ADD CONSTRAINT fk_linea_de_venta
                FOREIGN KEY(id_venta)
                REFERENCES compra(id_venta);
                
                CREATE TABLE venta
                (
                    id_venta SERIAL PRIMARY KEY,
                    num_venta VARCHAR(40) NOT NULL,
                    fecha DATE NOT NULL,
                    cliente VARCHAR(40)
                );
                
                CREATE TABLE linea_de_venta(
                    id_linea_de_venta SERIAL PRIMARY KEY,
                    id_venta INTEGER,
                    id_producto INTEGER NOT NULL,
                    cantidad INTEGER NOT NULL
                );
                
                ALTER TABLE linea_de_venta 
                ADD CONSTRAINT fk_linea_de_venta
                FOREIGN KEY(id_venta)
                REFERENCES venta(id_venta);`;
    client.query(sql, (err, result) => {
        release();
        if(err){
            return console.error('Error executing query',err.stack);
        }
        console.log('Ok');
    });
});
pool.end().then(() => {
    console.log('Pool has ended');
});