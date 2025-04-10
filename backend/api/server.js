const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors());

// Rutas de autenticación
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Rutas CRUD (incluyendo productos y filtrado)
const crudRoutes = require("./routes/crud");
app.use("/api", crudRoutes);

// Rutas de administración
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

// server.js (fragmento)
const checkoutRoutes = require("./routes/checkout");
app.use("/api", checkoutRoutes);


// Ruta de inicio (opcional)
app.get("/", (req, res) => {
  res.send("Ruta Inicio");
});

// Política de seguridad de contenido (opcional, revisar según el despliegue)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdnjs.cloudflare.com"
  );
  next();
});

// Servir el frontend estático
app.use(express.static(path.join(__dirname, "frontend")));

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto:", puerto);
});
