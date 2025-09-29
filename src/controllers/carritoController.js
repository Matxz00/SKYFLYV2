import Carrito from '../models/Carrito.js';
import Producto from '../models/Producto.js'; // Necesitas importar tu modelo de producto

// Función de utilidad para obtener o crear el carrito
const getOrCreateCart = async (userId) => {
    let carrito = await Carrito.findOne({ usuario: userId });
    if (!carrito) {
        carrito = new Carrito({ usuario: userId, items: [] });
        await carrito.save();
    }
    return carrito;
};

// GET /api/carrito
// Obtener el carrito del usuario logueado
export const getCarrito = async (req, res) => {
    // Asumimos que el ID del usuario está en req.uid, 
    // proporcionado por un middleware de autenticación (JWT)
    const userId = req.uid; 
    
    try {
        const carrito = await getOrCreateCart(userId);
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener el carrito.', error });
    }
};

// POST /api/carrito/agregar
// Agregar un producto al carrito o actualizar su cantidad
// POST /api/carrito/agregar
// Agregar un producto al carrito o actualizar su cantidad, verificando el stock
export const agregarProducto = async (req, res) => {
    const userId = req.uid; 
    const { productoId, cantidad } = req.body;

    // Validación básica
    if (!productoId || !cantidad || cantidad < 1) {
        return res.status(400).json({ msg: 'Faltan datos del producto o la cantidad es inválida.' });
    }

    try {
        // 1. Encontrar el producto en la DB para obtener precio, nombre y STOCK
        const productoDB = await Producto.findById(productoId);
        if (!productoDB || !productoDB.activo || productoDB.stock === 0) {
            return res.status(404).json({ msg: 'Producto no disponible o no encontrado.' });
        }
        
        // Stock disponible del producto
        const stockDisponible = productoDB.stock;

        const carrito = await getOrCreateCart(userId);
        const itemIndex = carrito.items.findIndex(item => item.producto.toString() === productoId);
        
        let nuevaCantidadTotal = cantidad;
        let esProductoExistente = false;

        if (itemIndex > -1) {
            // Producto ya existe: Calcular la nueva cantidad total deseada
            esProductoExistente = true;
            const cantidadActualEnCarrito = carrito.items[itemIndex].cantidad;
            nuevaCantidadTotal = cantidadActualEnCarrito + cantidad;
        }

        // 2. ⚠️ VALIDACIÓN CRÍTICA: Comparar la cantidad total deseada con el stock
        if (nuevaCantidadTotal > stockDisponible) {
            const cantidadMaxima = esProductoExistente 
                ? stockDisponible - carrito.items[itemIndex].cantidad 
                : stockDisponible;
            
            let mensaje = `Solo puedes agregar ${cantidadMaxima} unidades más. El stock actual es ${stockDisponible}.`;
            
            if (!esProductoExistente && stockDisponible < cantidad) {
                 mensaje = `No se puede agregar. Solo quedan ${stockDisponible} unidades en stock.`;
            } else if (stockDisponible === 0) {
                mensaje = "Producto agotado.";
            }

            return res.status(400).json({ 
                msg: 'Stock insuficiente para esta operación.', 
                detalle: mensaje 
            });
        }
        
        // 3. Actualización del carrito (Si las validaciones pasaron)
        if (esProductoExistente) {
            // Actualizar cantidad del ítem existente
            carrito.items[itemIndex].cantidad = nuevaCantidadTotal;
        } else {
            // Agregar nuevo ítem
            carrito.items.push({
                producto: productoId,
                nombre: productoDB.nombre, 
                precio: productoDB.precio, 
                cantidad: cantidad // La cantidad solicitada (que es menor al stock)
            });
        }

        await carrito.save(); // El pre-save hook calculará el nuevo total
        res.json({ msg: 'Producto agregado o cantidad actualizada.', carrito });

    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).json({ msg: 'Error al agregar el producto.', error });
    }
};

// DELETE /api/carrito/remover/:productoId
// Eliminar un producto por completo
export const removerProducto = async (req, res) => {
    const userId = req.uid;
    const { productoId } = req.params;

    try {
        const carrito = await getOrCreateCart(userId);
        
        // Filtrar todos los items cuyo ID de producto NO sea el que queremos eliminar
        const itemsAntes = carrito.items.length;
        carrito.items = carrito.items.filter(item => item.producto.toString() !== productoId);
        
        if (carrito.items.length === itemsAntes) {
            return res.status(404).json({ msg: 'Producto no encontrado en el carrito.' });
        }

        await carrito.save(); // Recalcula el total
        res.json({ msg: 'Producto eliminado del carrito.', carrito });

    } catch (error) {
        res.status(500).json({ msg: 'Error al remover el producto.', error });
    }
};