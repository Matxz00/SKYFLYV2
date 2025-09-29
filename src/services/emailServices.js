import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

// Configuración explícita para evitar problemas de firewall/puertos en entornos cloud (como Railway).
// Usamos el puerto 465, que requiere 'secure: true' (SMTPS).
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 465,
    secure: true, // true para puerto 465, false para otros (como 587)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Opcional: Aumentar el tiempo de espera si la conexión aún falla ocasionalmente
    connectionTimeout: 10000, // 10 segundos
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
