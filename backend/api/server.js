const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Importamos la conexión (ya la tienes en connection.js)
const conexion = require('./db/connection');

// Importar rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Importamos las rutas CRUD desde el archivo crud.js
const crudRoutes = require('./routes/crud');
app.use('/api', crudRoutes);

// Ruta de inicio (opcional)
app.get('/', (req, res) => {
  res.send('Ruta Inicio');
});

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto:", puerto);
});
