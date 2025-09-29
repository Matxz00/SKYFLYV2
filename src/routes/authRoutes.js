// routes/authRoutes.js
import { Router } from 'express';
import { 
    registerUser, 
    loginUser,
    verify2FA,
    forgotPassword, 
    resetPassword,
    verifyAccount,
    request2FA
} from '../controllers/authControllers.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// 2FA
router.post('/verify-account', verifyAccount); // <-- Activación de la cuenta inicial
router.post('/verify-2fa', verify2FA);        // <-- Verificación recurrente de login
router.post('/request-2fa', request2FA);      // <-- Reenvío de código 

// Restablecimiento
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword); // Recibe 'token' y 'newPassword' en el body

export default router;