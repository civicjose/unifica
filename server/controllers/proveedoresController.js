import pool from '../config/database.js';

// GET /api/proveedores - Obtener todos los proveedores
export const getAllProveedores = async (req, res) => {
  try {
    const [proveedores] = await pool.query('SELECT * FROM proveedores ORDER BY nombre_proveedor');
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener proveedores.' });
  }
};

// POST /api/proveedores - Crear un nuevo proveedor
export const createProveedor = async (req, res) => {
  const { nombre_proveedor, url_proveedor, contacto_principal, telefono, email } = req.body;
  if (!nombre_proveedor) {
    return res.status(400).json({ message: 'El nombre del proveedor es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre_proveedor, url_proveedor, contacto_principal, telefono, email) VALUES (?, ?, ?, ?, ?)',
      [nombre_proveedor, url_proveedor, contacto_principal, telefono, email]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al crear el proveedor.' });
  }
};

// PUT /api/proveedores/:id - Actualizar un proveedor
export const updateProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre_proveedor, url_proveedor, contacto_principal, telefono, email } = req.body;
  if (!nombre_proveedor) {
    return res.status(400).json({ message: 'El nombre del proveedor es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE proveedores SET nombre_proveedor = ?, url_proveedor = ?, contacto_principal = ?, telefono = ?, email = ? WHERE id = ?',
      [nombre_proveedor, url_proveedor, contacto_principal, telefono, email, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar el proveedor.' });
  }
};

// DELETE /api/proveedores/:id - Eliminar un proveedor
export const deleteProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM proveedores WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar. Este proveedor está asignado a servicios o aplicaciones.' });
    }
    res.status(500).json({ message: 'Error del servidor al eliminar el proveedor.' });
  }
};