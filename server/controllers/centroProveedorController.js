import pool from '../config/database.js';

export const addProveedorToCentro = async (req, res) => {
  const { centro_id, proveedor_id, aplicacion_id, categoria, detalles } = req.body;
  if (!centro_id || !categoria) {
    return res.status(400).json({ message: 'El ID del centro y la categoría son requeridos.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO centro_proveedor (centro_id, proveedor_id, aplicacion_id, categoria, detalles) VALUES (?, ?, ?, ?, ?)',
      [centro_id, proveedor_id || null, aplicacion_id || null, categoria, detalles ? JSON.stringify(detalles) : null]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al añadir el proveedor.' });
  }
};

export const updateProveedorInCentro = async (req, res) => {
  const { id } = req.params;
  const { proveedor_id, aplicacion_id, categoria, detalles } = req.body;
  if (!categoria) {
    return res.status(400).json({ message: 'La categoría es requerida.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE centro_proveedor SET proveedor_id = ?, aplicacion_id = ?, categoria = ?, detalles = ? WHERE id = ?',
      [proveedor_id || null, aplicacion_id || null, categoria, detalles ? JSON.stringify(detalles) : null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado.' });
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar.' });
  }
};

export const deleteProveedorFromCentro = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM centro_proveedor WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al eliminar.' });
  }
};