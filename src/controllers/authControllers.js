// controllers/authController.js
import Usuario from '../models/Usuario.js';
import { sendEmail } from '../services/emailServices.js';
import { generateJWT, generateVerificationCode } from '../utils/security.js';
import crypto from 'crypto'; 

// --- FUNCIÓN DE UTILIDAD: Enviar código 2FA/Verificación ---
const sendVerificationCode = async (usuario) => {
    // Generar y guardar el código temporal
    const code = generateVerificationCode();
    usuario.verificationCode = code;
    usuario.codeExpires = Date.now() + 600000; // Código válido por 10 minutos
    await usuario.save();

    await sendEmail(
        usuario.email,
        'Código de Verificación - Mi Aplicación',
        `<p>Tu código de ${usuario.twoFactorEnabled ? 'inicio de sesión' : 'activación de cuenta'} es: <b>${code}</b></p>`
    );
};

// --- POST /api/auth/register ---
// ⚠️ Nota: Esta versión crea el usuario y envía el código para su activación inicial.
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) return res.status(400).json({ msg: 'El correo ya está registrado.' });

        // Crear usuario. Por defecto, twoFactorEnabled es false.
        usuario = new Usuario({ username, email, password, twoFactorEnabled: false }); 
        await usuario.save();
        
        // 1. Enviar correo de verificación para activar la cuenta.
        await sendVerificationCode(usuario);

        res.status(201).json({ 
            msg: 'Usuario registrado. Revisa tu correo para el código de activación.',
            uid: usuario._id 
        });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ msg: 'Error al registrar el usuario.', error: error.message });
    }
};


// --- POST /api/auth/login ---
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ msg: 'Credenciales inválidas.' });
        
        // 1. Verificar la contraseña
        const isMatch = await usuario.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas.' });

        // 2. Verificar si la cuenta está activa (twoFactorEnabled = true/false)
        if (!usuario.twoFactorEnabled) {
            return res.status(403).json({ 
                msg: 'Cuenta inactiva. Por favor, verifica tu correo con el código de activación.', 
                pendingVerification: true 
            });
        }

        // 3. Lógica de 2FA (Si la cuenta está activa, se requiere el código)
        // Ya que usamos twoFactorEnabled para la activación inicial, asumo que 
        // una vez que es true, siempre requerirá la verificación de código para iniciar sesión.
        
        await sendVerificationCode(usuario); // Reutilizamos la función de envío

        return res.status(200).json({ 
            msg: '2FA requerido. Código enviado a tu correo.',
            twoFactor: true,
            uid: usuario._id 
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ msg: 'Error en el servidor.' });
    }
};


// --- POST /api/auth/verify-account (Activación inicial de la cuenta) ---
// Se usa después del registro para activar 'twoFactorEnabled: true'
export const verifyAccount = async (req, res) => {
    const { email, code } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ msg: 'Usuario no encontrado.' });

        if (usuario.twoFactorEnabled) {
             return res.status(200).json({ msg: 'La cuenta ya está activa. Procede con el login.' });
        }
        
        // 1. Verificar código y expiración
        if (usuario.verificationCode !== code || usuario.codeExpires < Date.now()) {
            return res.status(400).json({ msg: 'Código inválido o expirado.' });
        }

        // 2. Activar la cuenta/2FA y limpiar campos
        usuario.twoFactorEnabled = true; // Activa la cuenta
        usuario.verificationCode = undefined;
        usuario.codeExpires = undefined;
        await usuario.save();

        const token = generateJWT(usuario._id);
        res.json({ msg: 'Cuenta activada y verificada. Bienvenido.', token });

    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor.' });
    }
};


// --- POST /api/auth/verify-2fa (Verificación de login recurrente) ---
// Se usa después de un login exitoso que requirió 2FA (Paso 2 del login)
export const verify2FA = async (req, res) => {
    const { email, code } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ msg: 'Usuario no encontrado.' });

        if (!usuario.twoFactorEnabled) {
            return res.status(403).json({ msg: '2FA no está activo para este usuario.' });
        }

        // 1. Verificar que el código exista y no haya expirado
        if (usuario.verificationCode !== code || usuario.codeExpires < Date.now()) {
            return res.status(400).json({ msg: 'Código inválido o expirado.' });
        }

        // 2. Limpiar campos y generar token de sesión
        usuario.verificationCode = undefined;
        usuario.codeExpires = undefined;
        await usuario.save();

        const token = generateJWT(usuario._id);
        res.json({ msg: 'Verificación 2FA exitosa. Bienvenido.', token });

    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor.' });
    }
};


// --- POST /api/auth/request-2fa (Reenvío de código 2FA) ---
export const request2FA = async (req, res) => {
    const { email } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado.' });
        
        // Si la cuenta no está activa, no se puede reenviar el código.
        if (!usuario.twoFactorEnabled) {
            return res.status(403).json({ msg: 'Cuenta inactiva. Usa la ruta de activación inicial.' });
        }

        await sendVerificationCode(usuario);
        
        res.json({ msg: 'Nuevo código 2FA enviado a tu correo.' });

    } catch (error) {
        res.status(500).json({ msg: 'Error al reenviar el código.' });
    }
};


// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado.' });

        // ⚠️ CAMBIO CRÍTICO: Generar un código numérico
        const resetCode = generateVerificationCode();
        
        // El campo de Mongoose "resetPasswordToken" ahora almacenará el código numérico
        usuario.resetPasswordToken = resetCode; 
        usuario.resetPasswordExpires = Date.now() + 600000; // Válido por 10 minutos
        await usuario.save();
        
        // ⚠️ CAMBIO CRÍTICO: Enviar el código directamente en el cuerpo del correo
        await sendEmail(
            usuario.email,
            'Código de Restablecimiento de Contraseña - Mi App',
            `
            <p>Has solicitado restablecer tu contraseña. </p>
            <p>Tu código de restablecimiento es: <b>${resetCode}</b></p>
            <p>Este código es válido por 10 minutos. Úsalo en el formulario de tu aplicación para ingresar una nueva contraseña.</p>
            `
        );

        res.json({ msg: 'Código de restablecimiento enviado a tu correo electrónico.' });

    } catch (error) {
        // En caso de error, limpiar los campos
        if (usuario) {
             usuario.resetPasswordToken = undefined;
             usuario.resetPasswordExpires = undefined;
             await usuario.save();
        }
        res.status(500).json({ msg: 'Error al procesar la solicitud.' });
    }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
    // ⚠️ CAMBIO CRÍTICO: Esperar 'code' en lugar de 'token' en la petición
    const { code, email, newPassword } = req.body; 
    
    try {
        // 1. Encontrar el usuario por email (más seguro) y verificar el código
        const usuario = await Usuario.findOne({
            email: email, // Usamos el email para encontrar al usuario
            resetPasswordToken: code, // Buscamos por el código que ahora está en este campo
            resetPasswordExpires: { $gt: Date.now() } // Verificar que no haya expirado
        });

        if (!usuario) {
            return res.status(400).json({ msg: 'Código, email inválido o el código ha expirado. Inténtalo de nuevo.' });
        }

        // 2. Aplicar nueva contraseña y limpiar campos
        usuario.password = newPassword;
        usuario.resetPasswordToken = undefined;
        usuario.resetPasswordExpires = undefined;
        
        await usuario.save(); // El hook 'pre-save' hashea la contraseña

        res.json({ msg: 'Contraseña restablecida exitosamente. Puedes iniciar sesión.' });

    } catch (error) {
        res.status(500).json({ msg: 'Error al restablecer la contraseña.' });
    }
};