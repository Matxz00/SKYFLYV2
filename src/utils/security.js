// utils/security.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

// Generar JWT
export const generateJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Generar código numérico de 6 dígitos
export const generateVerificationCode = () => {
    // Genera un número entre 100000 y 999999
    return crypto.randomInt(100000, 999999).toString();
};