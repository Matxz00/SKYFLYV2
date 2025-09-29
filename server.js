// server.js (o index.js)

import express from 'express';
import * as dotenv from 'dotenv'; // Importa dotenv para cargar .env
// Importa la función de conexión usando la extensión '.js'
import { dbConnection } from './db/config.js'; 
// Importa tus rutas de autenticación
import authRoutes from './src/routes/authRoutes.js'; 
// Importar rutas de carrito
import carritoRoutes from './src/routes/carritoRoutes.js'
// Importar rutas de producto
import productoRoutes from './src/routes/productoRoutes.js'


// 1. Cargar Variables de Entorno (¡Necesario para JWT_SECRET y EMAIL_USER!)
dotenv.config();

// 2. Conexión a DB
dbConnection();

// 3. Configuración de Express
const app = express();
const port = process.env.PORT || 4000;

// Middleware: Permite que Express lea JSON en el body de las peticiones
app.use(express.json());

// 4. Montar Rutas de Autenticación
app.use('/api/auth', authRoutes); // <--- Línea agregada
app.use('/api/carrito', carritoRoutes);
app.use('/api/producto', productoRoutes);



// 5. Rutas de prueba
app.get('/', (req, res) => {
  res.json({ msg: 'API funcionando y conectada a MongoDB.' });
});

// 6. Iniciar Servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});