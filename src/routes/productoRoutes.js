import { Router } from 'express';
import { 
    crearProducto, 
    obtenerProductos, 
    obtenerProductoPorId,
    actualizarProducto, // <-- Nueva
    eliminarProducto    // <-- Nueva
} from '../controllers/productoControllers.js';
import { validarJWT } from '../middlewares/validar-jwt.js'; 

const router = Router();

// Rutas Públicas (Lectura)
router.get('/', obtenerProductos);           // GET todos
router.get('/:id', obtenerProductoPorId);   // GET uno

// Rutas Protegidas (Requieren autenticación JWT)
// Estas rutas simulan la administración del inventario.
router.post('/', validarJWT, crearProducto);        // POST (Crear)
router.put('/:id', validarJWT, actualizarProducto); // PUT (Actualizar)
router.delete('/:id', validarJWT, eliminarProducto);// DELETE (Eliminar/Desactivar)

export default router;