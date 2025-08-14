import pool from '../config/database.js';

// POST /api/sede-proveedor - Añadir un proveedor a una sede
export const addProveedorToSede = async (req, res) => {
  const { sede_id, proveedor_id, aplicacion_id, categoria, detalles } = req.body;
  if (!sede_id || !categoria) {
    return res.status(400).json({ message: 'El ID de la sede y la categoría son requeridos.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO sede_proveedor (sede_id, proveedor_id, aplicacion_id, categoria, detalles) VALUES (?, ?, ?, ?, ?)',
      [sede_id, proveedor_id || null, aplicacion_id || null, categoria, detalles ? JSON.stringify(detalles) : null]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al añadir el proveedor.' });
  }
};

// PUT /api/sede-proveedor/:id - Actualizar un proveedor de una sede
export const updateProveedorInSede = async (req, res) => {
  const { id } = req.params;
  const { proveedor_id, aplicacion_id, categoria, detalles } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE sede_proveedor SET proveedor_id = ?, aplicacion_id = ?, categoria = ?, detalles = ? WHERE id = ?',
      [proveedor_id || null, aplicacion_id || null, categoria, detalles ? JSON.stringify(detalles) : null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado.' });
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar.' });
  }
};

// DELETE /api/sede-proveedor/:id - Desvincular un proveedor de una sede
export const deleteProveedorFromSede = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM sede_proveedor WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al eliminar.' });
  }
};