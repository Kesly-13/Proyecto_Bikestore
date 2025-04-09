CREATE DATABASE bike_store;
USE bike_store;

-- Tabla de usuarios: registra la información de los clientes
CREATE TABLE Usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
contraseña VARCHAR(255) NOT NULL,
telefono VARCHAR(20),
direccion VARCHAR(255),
role VARCHAR(50) DEFAULT 'cliente',
fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);











CREATE TABLE Productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    categoria ENUM('bicicletas', 'ropa_deportiva', 'equipamiento', 'suplementos', 'accesorios') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    disponibilidad ENUM('disponible', 'agotado', 'proxima-llegada') NOT NULL,
    descripcion TEXT,
    caracteristicas TEXT,
    imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE Productos
ADD COLUMN marca VARCHAR(100) AFTER categoria,
ADD COLUMN stock INT DEFAULT 0 AFTER precio;


-- Luego vuelve a ejecutar el script de creación de la tabla.

SHOW COLUMNS FROM Productos;

SELECT * FROM Productos;

ALTER TABLE Productos 
MODIFY categoria ENUM(
    'bicicletas',
    'ropa_deportiva',
    'equipamiento',
    'suplementos',
    'accesorios'
) NOT NULL;













SELECT * FROM Usuarios;
SELECT id, email, role FROM clientes WHERE email = 'admin@example.com';
SHOW COLUMNS FROM clientes;

SELECT id, role FROM Usuarios WHERE id = 1;

UPDATE Usuarios 
SET role = 'admin' 
WHERE id = 1 LIMIT 1;


UPDATE Usuarios
SET role = admin
WHERE id = 1;

-- Tabla Carrito
CREATE TABLE Carrito (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
producto_nombre VARCHAR(255) NOT NULL,
producto_precio DECIMAL(10, 2) NOT NULL,
producto_imagen VARCHAR(255),
cantidad INT DEFAULT 1,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- Tabla Favoritos
CREATE TABLE Favoritos (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
producto_nombre VARCHAR(255) NOT NULL,
producto_precio DECIMAL(10, 2) NOT NULL,
producto_imagen VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

SELECT * FROM Carrito;
SELECT * FROM Favoritos;




-- Tabla de pedidos (información general del pedido)
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'pendiente',
  direccion_envio VARCHAR(255) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  notas TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla detalle_pedidos (productos individuales en cada pedido)
CREATE TABLE detalle_pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla ventas (registro financiero de ventas completadas)
CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
  monto_total DECIMAL(10, 2) NOT NULL,
  comision_plataforma DECIMAL(10, 2) DEFAULT 0,
  impuestos DECIMAL(10, 2) DEFAULT 0,
  monto_neto DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);



SELECT * FROM Usuarios;
SELECT id, email, role FROM clientes WHERE email = 'admin@example.com';
SHOW COLUMNS FROM clientes;

SELECT * FROM Carrito;
SELECT * FROM Favoritos;

SELECT * FROM Carrito WHERE usuario_id = 1;
SELECT * FROM Favoritos WHERE usuario_id = 1;