// connection.js
const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bura12325',
    database: 'bike_store',
    port: 3307
    // debug: true
});

// Función para la conexión y la reconexión
function conectarBD() {
    conexion.connect((error) => {
        if (error) {
            console.log('[db error]', error);
            setTimeout(conectarBD, 200);
        } else {
            console.log('¡Conexión exitosa a la base de datos!');
        }
    });

    conexion.on('error', error => {
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            conectarBD();
        } else {
            throw error;
        }
    });
}

conectarBD();

module.exports = conexion;