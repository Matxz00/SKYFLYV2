import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

// Configuración explícita para evitar problemas de firewall/puertos en entornos cloud (como Railway).
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587, // CAMBIO: Usar puerto 587
    secure: false, // CAMBIO: secure: false para puerto 587 (usa STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Añade la opción 'requireTLS' para forzar STARTTLS
    requireTLS: true, 
    connectionTimeout: 10000, 
    greetingTimeout: 5000, 
});

export const sendEmail = (to, subject, html) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    console.log(`Intentando enviar correo a ${to} con asunto: ${subject}`);
    
    return transporter.sendMail(mailOptions);
};
