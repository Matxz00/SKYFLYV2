import { Schema, model } from 'mongoose';

const CarritoItemSchema = new Schema({
    // Referencia al Producto (asumiendo que tienes un modelo 'Producto')
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto', 
        required: true
    },
    // Nombre, precio, etc., se pueden guardar aquí para evitar consultar el Producto
    nombre: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
}, { _id: false }); // No necesitamos IDs separados para cada item del carrito

const CarritoSchema = new Schema({
    // Referencia al usuario, garantizando que cada usuario tenga un carrito.
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        unique: true // CRÍTICO: Solo un carrito por usuario
    },
    // Array de los productos agregados al carrito
    items: [CarritoItemSchema],
    
    // Campo opcional para el cálculo rápido del total (se calcula en el controlador)
    total: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Middleware pre-save para calcular el total
CarritoSchema.pre('save', function(next) {
    let totalCalculado = 0;
    this.items.forEach(item => {
        totalCalculado += item.precio * item.cantidad;
    });
    this.total = totalCalculado;
    next();
});

export default model('Carrito', CarritoSchema);