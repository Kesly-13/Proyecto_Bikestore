const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bura12325',
    database: 'bike_store',
    port: 3307
});

// Funcion para la conexión y la reconexión
function conectarBD(){
    conexion.connect((error)=> {
        if(error){
            console.log('[db error]', error);
            setTimeout(conectarBD, 200);
        } else {
            console.log('¡Conexión exitosa a la base de datos!');
        }
    });

    conexion.on('error', error =>{
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            conectarBD();
        } else {
            throw error;
        }
    });
}

conectarBD();

//////// CRUD COMPLETO ////////
// Funcion genérica para obtener todos los registros de una tabla específica
function obtenerTodos(tabla){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla}`, (error, resultados)=>{
            if(error) reject(error);
            else resolve(resultados);
        });
    });
}

// Obtiene un registro de la tabla por su ID
function obtenerUno(tabla, id){
    return new Promise((resolve, reject)=>{
        // Corregimos el segundo parámetro a [id]
        conexion.query(`SELECT * FROM ${tabla} WHERE id = ?`, [id], (error, resultado)=>{
            if(error) reject(error);
            else resolve(resultado);
        });
    });
}

// Crear o Insertar un registro en una tabla
function crear(tabla, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, resultado)=>{
            if(error) reject(error);
            else {
                Object.assign(data, {id: resultado.insertId});
                resolve(data);
            }
        });
    });
}

// Actualiza un registro en una tabla por su id
function actualizar(tabla, id, data){
    return new Promise((resolve,reject)=>{
        conexion.query(`UPDATE ${tabla} SET ? WHERE id = ?`, [data, id], (error, resultado)=>{
            if (error) reject(error);
            else resolve(resultado);
        });
    });
}

// Elimina un registro de una tabla por su ID
function eliminar(tabla, id){
    return new Promise((resolve,reject)=>{
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, [id], (error, resultado)=>{
            if (error) reject(error);
            else resolve(resultado);
        });
    });
}

// Ruta de inicio 
app.get('/', (req, res)=>{
    res.send('Ruta Inicio');
});

// Esta ruta me devuelve todos los registros
app.get('/api/:tabla', async(req, res)=>{
    try {
        const resultados = await obtenerTodos(req.params.tabla);
        res.send(resultados);
    } catch(error) {
        res.status(500).send(error);
    }
});

// Esta ruta me devuelve un registro por su ID
app.get('/api/:tabla/:id', async (req, res)=>{
    try {
        const resultado = await obtenerUno(req.params.tabla, req.params.id);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Esta ruta crea un registro en la tabla
app.post('/api/:tabla', async(req, res)=>{
    try {
        const resultado = await crear(req.params.tabla, req.body);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Esta ruta actualiza un registro en la tabla por su ID
app.put('/api/:tabla/:id', async(req, res)=>{
    try {
        const resultado = await actualizar(req.params.tabla, req.params.id, req.body);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Esta ruta elimina un registro en la tabla por su ID
app.delete('/api/:tabla/:id', async(req, res)=>{
    try {
        const resultado = await eliminar(req.params.tabla, req.params.id);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});

//Se ha realizado o no la conexión en el puerto configurado
// Cambiamos PUERT por PORT
const puerto = process.env.PORT || 3000;
app.listen(puerto, ()=>{
    console.log("Servidor corriendo en el puerto:", puerto);
});