import pool from '../config/database.js';

// GET /api/categorias-proveedor - Obtener todas las categorías
export const getAllCategorias = async (req, res) => {
  try {
    const [categorias] = await pool.query('SELECT * FROM categorias_proveedor ORDER BY nombre_categoria');
    // Parseamos el campo JSON para cada categoría
    const categoriasProcesadas = categorias.map(cat => ({
      ...cat,
      campos_formulario: JSON.parse(cat.campos_formulario || '[]')
    }));
    res.json(categoriasProcesadas);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener las categorías.' });
  }
};

// POST /api/categorias-proveedor - Crear una nueva categoría
export const createCategoria = async (req, res) => {
  const { nombre_categoria, campos_formulario } = req.body;
  if (!nombre_categoria) {
    return res.status(400).json({ message: 'El nombre de la categoría es requerido.' });
  }
  try {
    const camposJson = JSON.stringify(campos_formulario || []);
    const [result] = await pool.query(
      'INSERT INTO categorias_proveedor (nombre_categoria, campos_formulario) VALUES (?, ?)',
      [nombre_categoria, camposJson]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al crear la categoría.' });
  }
};

// PUT /api/categorias-proveedor/:id - Actualizar una categoría
export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre_categoria, campos_formulario } = req.body;
  if (!nombre_categoria) {
    return res.status(400).json({ message: 'El nombre de la categoría es requerido.' });
  }
  try {
    const camposJson = JSON.stringify(campos_formulario || []);
    const [result] = await pool.query(
      'UPDATE categorias_proveedor SET nombre_categoria = ?, campos_formulario = ? WHERE id = ?',
      [nombre_categoria, camposJson, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar la categoría.' });
  }
};

// DELETE /api/categorias-proveedor/:id - Eliminar una categoría
export const deleteCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    // Aquí podrías añadir una comprobación para ver si la categoría está en uso antes de borrar
    const [result] = await pool.query('DELETE FROM categorias_proveedor WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
     if (error.code === 'ER_ROW_IS_REFERENCED_2') { // Asumiendo que podría estar referenciada en el futuro
        return res.status(400).json({ message: 'No se puede eliminar. Esta categoría está en uso.' });
    }
    res.status(500).json({ message: 'Error del servidor al eliminar la categoría.' });
  }
};