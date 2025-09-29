// middlewares/validar-jwt.js

import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

// Exporta esta función para usarla en tus rutas
export const validarJWT = (req, res, next) => {
    // 1. Leer el token del header
    // El cliente debe enviar el token en el formato: Authorization: Bearer <token>
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({
            msg: 'Acceso denegado. No hay token en la petición.'
        });
    }

    // El header 'Authorization' es 'Bearer <token>'. Quitamos 'Bearer ' para obtener solo el token.
    const tokenClean = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    try {
        // 2. Verificar el token
        // Usa la misma clave secreta que usaste para firmar el token en el login
        const { id } = jwt.verify(
            tokenClean,
            process.env.JWT_SECRET 
        );

        // 3. Adjuntar el ID del usuario a la petición
        // Esto permite que los controladores (ej., carritoController) sepan quién es el usuario
        req.uid = id; 
        
        // 4. Continuar al siguiente middleware/controlador
        next();

    } catch (error) {
        // Manejar errores de token inválido o expirado
        console.error("Error al validar JWT:", error.message);
        return res.status(401).json({
            msg: 'Token no válido o ha expirado.'
        });
    }
};