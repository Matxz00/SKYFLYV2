import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors'; // Importamos el middleware CORS
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

// =================================================================
// 3. CONFIGURACIÓN DE CORS
// =================================================================
// Define los orígenes (URLs) de tu frontend que tienen permiso para acceder a esta API.
// Esto previene que sitios maliciosos consuman tu API.
const allowedOrigins = [
  'http://localhost:4200', 
  'http://127.0.0.1:3000', 
  // 'https://tudominio-frontend-en-produccion.com' // <-- AÑADE AQUÍ TU URL DE PRODUCCIÓN
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite si el origen está en la lista O si no hay origen (peticiones como Postman, cURL)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acceso no permitido por la política CORS.'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Define los métodos HTTP permitidos
  credentials: true, // Permite el envío de cookies/encabezados de autorización
  optionsSuccessStatus: 204
};


// 4. Configuración de Express
const app = express();
const port = process.env.PORT || 4000;

// Middleware CORS - Aplicar la configuración
app.use(cors(corsOptions));

// Middleware: Permite que Express lea JSON en el body de las peticiones
app.use(express.json());

// 5. Montar Rutas de Autenticación
app.use('/api/auth', authRoutes); // <--- Línea agregada
app.use('/api/carrito', carritoRoutes);
app.use('/api/producto', productoRoutes);


// 6. Rutas de prueba
app.get('/', (req, res) => {
  res.json({ msg: 'API funcionando y conectada a MongoDB.' });
});

// 7. Iniciar Servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
