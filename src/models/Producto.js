import { Schema, model } from 'mongoose';

const ProductoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio.'],
        trim: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria.'],
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio.'],
        min: 0
    },
    stock: { // Cantidad de unidades disponibles
        type: Number,
        required: [true, 'El stock es obligatorio.'],
        default: 0,
        min: 0
    },
    activo: { // Si el producto está disponible para la venta
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model('Producto', ProductoSchema);