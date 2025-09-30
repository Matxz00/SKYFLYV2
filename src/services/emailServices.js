// src/services/emailServices.js

import * as brevo from '@getbrevo/brevo';
import * as dotenv from 'dotenv';
dotenv.config();

// Inicializa el cliente de Brevo con la clave API
const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY; 

// Verificación básica de que la clave se cargó
if (!process.env.BREVO_API_KEY) {
    console.error("ERROR: La variable de entorno BREVO_API_KEY no está configurada.");
}


/**
 * Envía un correo electrónico usando la API HTTP de Brevo.
 * * @param {string} to - Destinatario del correo.
 * @param {string} subject - Asunto del correo.
 * @param {string} htmlContent - Contenido HTML del correo.
 */
export const sendEmail = async (to, subject, htmlContent) => {
    
    const fromEmail = process.env.EMAIL_FROM;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = subject;
    // El remitente debe ser una dirección validada en el panel de Brevo
    sendSmtpEmail.sender = { email: fromEmail }; 
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.htmlContent = htmlContent;
    
    console.log(`Intentando enviar correo a ${to} usando la API HTTP de Brevo.`);
    
    try {
        // La conexión usa HTTPS (puerto 443), que no será bloqueado por Railway
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        console.log('Correo enviado con éxito (API HTTP). ID:', response.body.messageId);
        return response.body;

    } catch (error) {
        // Un error 401 aquí significa que la BREVO_API_KEY es incorrecta.
        // Un error 400/403 podría significar que EMAIL_FROM no está validado.
        const errorMessage = error.response ? error.response.text : error.message;
        console.error('Error al enviar correo con Brevo (API):', errorMessage);
        throw new Error(`Fallo al enviar el correo: ${errorMessage}`);
    }
};