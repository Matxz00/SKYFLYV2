import Producto from '../models/Producto.js';

// POST /api/productos
// 🎯 CREAR un nuevo producto
export const crearProducto = async (req, res) => {
    // ⚠️ Se asume que el usuario tiene un token JWT válido (ruta protegida)
    const { nombre, descripcion, precio, stock } = req.body;

    try {
        const existeProducto = await Producto.findOne({ nombre });
        if (existeProducto) {
            return res.status(400).json({ msg: `El producto con nombre "${nombre}" ya existe.` });
        }

        const producto = new Producto({ nombre, descripcion, precio, stock });
        await producto.save();
        
        res.status(201).json({ msg: 'Producto creado exitosamente.', producto });

    } catch (error) {
        // Manejar errores de validación de Mongoose o de servidor
        console.error('Error al crear el producto:', error);
        res.status(500).json({ msg: 'Error interno del servidor al crear el producto.' });
    }
};

// GET /api/productos
// 🎯 LEER todos los productos
export const obtenerProductos = async (req, res) => {
    try {
        // Obtenemos todos los productos (puedes añadir { activo: true } si solo quieres los disponibles)
        const productos = await Producto.find({}).sort({ createdAt: -1 });
        
        res.json({ productos });

    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener los productos.' });
    }
};

// GET /api/productos/:id
// 🎯 LEER un producto por ID
export const obtenerProductoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findById(id);

        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado.' });
        }

        res.json({ producto });

    } catch (error) {
        // Captura errores si el ID no tiene el formato correcto de ObjectId
        res.status(400).json({ msg: 'ID de producto inválido.' });
    }
};

// PUT /api/productos/:id
// 🎯 ACTUALIZAR un producto existente
export const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, activo } = req.body;
    
    // El 'new: true' devuelve el documento modificado
    const updateOptions = { new: true, runValidators: true }; 

    try {
        const producto = await Producto.findByIdAndUpdate(
            id, 
            { nombre, descripcion, precio, stock, activo }, 
            updateOptions
        );

        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado.' });
        }

        res.json({ msg: 'Producto actualizado exitosamente.', producto });

    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        // Manejar error de validación (ej: precio negativo) o ID inválido
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ msg: 'ID de producto inválido.' });
        }
        res.status(500).json({ msg: 'Error al actualizar el producto.' });
    }
};

// DELETE /api/productos/:id
// 🎯 ELIMINAR un producto (Eliminación lógica: marcar como inactivo)
export const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    
    // **Opción 1: Eliminación Lógica** (Recomendada para E-commerce)
    // El producto se mantiene en la DB pero se marca como inactivo
    const updateOptions = { new: true }; 
    
    try {
        const producto = await Producto.findByIdAndUpdate(
            id,
            { activo: false }, // Marcamos como inactivo
            updateOptions
        );
        
        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado.' });
        }
        
        // **Opcional: Si quieres la eliminación física (menos recomendado):**
        // await Producto.findByIdAndDelete(id); 
        // res.json({ msg: 'Producto eliminado físicamente.' });

        res.json({ msg: 'Producto eliminado (marcado como inactivo) exitosamente.', producto });

    } catch (error) {
        res.status(400).json({ msg: 'ID de producto inválido o error al eliminar.' });
    }
};