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
  const { nombre_proveedor, url_proveedor, contacto_principal, telefono, email, observaciones } = req.body;
  if (!nombre_proveedor) {
    return res.status(400).json({ message: 'El nombre del proveedor es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE proveedores SET nombre_proveedor = ?, url_proveedor = ?, contacto_principal = ?, telefono = ?, email = ?, observaciones = ? WHERE id = ?',
      [nombre_proveedor, url_proveedor, contacto_principal, telefono, email, observaciones, id]
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

export const getContactsByProvider = async (req, res) => {
  const { proveedorId } = req.params;
  try {
    const [contacts] = await pool.query('SELECT * FROM proveedor_contactos WHERE proveedor_id = ? ORDER BY nombre', [proveedorId]);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener los contactos.' });
  }
};

// POST /api/proveedores/:proveedorId/contactos - Crear un nuevo contacto para un proveedor
export const createContact = async (req, res) => {
  const { proveedorId } = req.params;
  const { nombre, cargo, email, telefono, observaciones } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre del contacto es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO proveedor_contactos (proveedor_id, nombre, cargo, email, telefono, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
      [proveedorId, nombre, cargo, email, telefono, observaciones]
    );
    res.status(201).json({ id: result.insertId, proveedor_id: proveedorId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al crear el contacto.' });
  }
};

// PUT /api/proveedores/contactos/:id - Actualizar un contacto existente
export const updateContact = async (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, email, telefono, observaciones } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre del contacto es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE proveedor_contactos SET nombre = ?, cargo = ?, email = ?, telefono = ?, observaciones = ? WHERE id = ?',
      [nombre, cargo, email, telefono, observaciones, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contacto no encontrado.' });
    }
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar el contacto.' });
  }
};

// DELETE /api/proveedores/contactos/:id - Eliminar un contacto
export const deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM proveedor_contactos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contacto no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    // Si el contacto está asignado a algo (ej. una aplicación), dará un error de foreign key
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar. Este contacto está asignado como responsable de una aplicación.' });
    }
    res.status(500).json({ message: 'Error del servidor al eliminar el contacto.' });
  }
};

export const getProveedorById = async (req, res) => {
  const { id } = req.params;
  try {
    const [proveedores] = await pool.query('SELECT * FROM proveedores WHERE id = ?', [id]);
    if (proveedores.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }
    res.json(proveedores[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener el proveedor.' });
  }
};

// GET /api/aplicaciones/:id/contactos -  Obetener todos los centros y sedes donde está vinculado un proveedor

export const getVinculosByProvider = async (req, res) => {
  const { id } = req.params;
  try {
    const [centros] = await pool.query(`
      SELECT c.id, c.nombre_centro as nombre, 'Centro' as tipo, cp.categoria
      FROM centro_proveedor cp
      JOIN centros c ON cp.centro_id = c.id
      WHERE cp.proveedor_id = ?
    `, [id]);
    
    const [sedes] = await pool.query(`
      SELECT s.id, s.nombre_sede as nombre, 'Sede' as tipo, sp.categoria
      FROM sede_proveedor sp
      JOIN sedes s ON sp.sede_id = s.id
      WHERE sp.proveedor_id = ?
    `, [id]);
    
    res.json([...centros, ...sedes]);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener los vínculos.' });
  }
};