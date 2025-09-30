// models/Usuario.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UsuarioSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    twoFactorEnabled: { type: Boolean, default: true }, // Lo mantienes, indica si el 2FA está activado
    createdAt: { type: Date, default: Date.now },
    
    // --- Campos Temporales Necesarios ---
    // 1. Para la verificación de 2FA/Registro:
    verificationCode: { type: String }, // Código numérico para verificar
    codeExpires: { type: Date },       // Caducidad del código
    
    // 2. Para el restablecimiento de contraseña:
    resetPasswordToken: { type: String }, 
    resetPasswordExpires: { type: Date },
    // ----------------------------------------
});

// Hook 'pre-save' para hashear la contraseña antes de guardar
UsuarioSchema.pre('save', async function (next) {
    // Solo hashear si la contraseña ha sido modificada (o es nueva)
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método de instancia para comparar la contraseña (uso en Login)
UsuarioSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Usuario', UsuarioSchema);