import pool from '../config/database.js';

// GET /api/aplicaciones - Obtener todas las aplicaciones con el nombre de su proveedor
export const getAllAplicaciones = async (req, res) => {
  try {
    const query = `
      SELECT a.id, a.nombre_aplicacion, a.proveedor_id, p.nombre_proveedor
      FROM aplicaciones a
      LEFT JOIN proveedores p ON a.proveedor_id = p.id
      ORDER BY a.nombre_aplicacion
    `;
    const [aplicaciones] = await pool.query(query);
    res.json(aplicaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener aplicaciones.' });
  }
};

// POST /api/aplicaciones - Crear una nueva aplicación
export const createAplicacion = async (req, res) => {
  const { nombre_aplicacion, proveedor_id } = req.body;
  if (!nombre_aplicacion) {
    return res.status(400).json({ message: 'El nombre de la aplicación es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO aplicaciones (nombre_aplicacion, proveedor_id) VALUES (?, ?)',
      [nombre_aplicacion, proveedor_id || null]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al crear la aplicación.' });
  }
};

// PUT /api/aplicaciones/:id - Actualizar una aplicación
export const updateAplicacion = async (req, res) => {
  const { id } = req.params;
  const { nombre_aplicacion, proveedor_id } = req.body;
  if (!nombre_aplicacion) {
    return res.status(400).json({ message: 'El nombre de la aplicación es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE aplicaciones SET nombre_aplicacion = ?, proveedor_id = ? WHERE id = ?',
      [nombre_aplicacion, proveedor_id || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Aplicación no encontrada.' });
    }
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar la aplicación.' });
  }
};

// DELETE /api/aplicaciones/:id - Eliminar una aplicación
export const deleteAplicacion = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM aplicaciones WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Aplicación no encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
     if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar. Esta aplicación está asignada a un servicio.' });
    }
    res.status(500).json({ message: 'Error del servidor al eliminar la aplicación.' });
  }
};