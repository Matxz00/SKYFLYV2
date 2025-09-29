import { Router } from 'express';
import { agregarProducto, getCarrito, removerProducto } from '../controllers/carritoController.js';
// ⚠️ NECESITAS TU MIDDLEWARE JWT:
// Asumo que tienes una función llamada validarJWT que extrae el UID del token.
import { validarJWT } from '../middlewares/validar-jwt.js'; 

const router = Router();

// Todas las rutas del carrito deben estar protegidas por JWT
router.use(validarJWT); 

// Obtener carrito (GET /api/carrito)
router.get('/', getCarrito);

// Agregar producto (POST /api/carrito/agregar)
router.post('/agregar', agregarProducto);

// Remover producto (DELETE /api/carrito/remover/:productoId)
router.delete('/remover/:productoId', removerProducto);

export default router;