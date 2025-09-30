// src/services/emailServices.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; 

// Carga las variables de entorno del archivo .env
dotenv.config();

// --- 1. Inicialización del Transportador ---
// Usamos la configuración segura (SMTPS) para Gmail: Puerto 465 y secure: true
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,    // 'smtp.gmail.com'
    port: 465, // Hardcodeamos 465 ya que es la configuración segura
    secure: true, // Debe ser true para el puerto 465
    auth: {
        user: process.env.EMAIL_USER,    // Tu correo de Gmail
        pass: process.env.EMAIL_PASS     // ¡Tu Contraseña de Aplicación de Google!
    },
    // Añadimos un tiempo de espera más largo para evitar el ETIMEDOUT en entornos de despliegue
    connectionTimeout: 15000, 
    greetingTimeout: 5000, 
});

// Verificación opcional del estado de la conexión (útil para el debugging)
transporter.verify(function (error, success) {
    if (error) {
        console.error('Error al conectar con el servidor de correo:', error.message);
        console.error('Verifica que EMAIL_PASS es una Contraseña de Aplicación de Google.');
    } else {
        console.log('Servidor de correo de Gmail listo para enviar mensajes.');
    }
});

// --- 2. Función de Envío ---

/**
 * Envía un correo electrónico usando Nodemailer.
 * @param {string} to - Destinatario del correo.
 * @param {string} subject - Asunto del correo.
 * @param {string} html - Contenido HTML del correo.
 * @returns {Promise<any>} - El resultado de la operación de envío.
 */
export const sendEmail = (to, subject, html) => {
    
    const mailOptions = {
        from: process.env.EMAIL_USER, // El remitente es tu propio correo
        to,
        subject,
        html,
    };

    console.log(`Intentando enviar correo a ${to} con asunto: ${subject}`);
    
    // Retorna la promesa de Nodemailer
    return transporter.sendMail(mailOptions)
        .catch(error => {
            console.error('Error en el envío de correo:', error);
            // Re-lanza el error para que el controlador lo maneje
            throw error; 
        });
};