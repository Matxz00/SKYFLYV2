// db/config.js

// Importa 'config' de dotenv, no necesitas 'require'
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Configura dotenv para cargar variables desde .env
dotenv.config();

// Define la función de conexión asíncrona
const dbConnection = async () => {
    try {
        // Accede a la variable de entorno
        const uri = process.env.DB_URI;
        if (!uri) {
            throw new Error("DB_URI no está definido en el archivo .env");
        }

        await mongoose.connect(uri);

        console.log('✅ Conexión a MongoDB Atlas exitosa.');

    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        // Salir del proceso si la conexión falla es una buena práctica
        process.exit(1); 
    }
};

// Exporta la función para usarla en el archivo principal
export { dbConnection };