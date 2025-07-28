// server/controllers/trabajadoresController.js
import pool from '../config/database.js';

const getAllTrabajadores = async (req, res) => {
  const { search, centros, puestos } = req.query;

  let query = `
    SELECT 
      t.id, t.nombre, t.apellidos, t.email, t.telefono, 
      t.estado, t.fecha_alta, t.fecha_baja,
      p.nombre_puesto as puesto,
      s.nombre_sede as sede,
      c.nombre_centro as centro
    FROM trabajadores t
    LEFT JOIN puestos p ON t.puesto_id = p.id
    LEFT JOIN sedes s ON t.sede_id = s.id
    LEFT JOIN centros c ON t.centro_id = c.id
  `;

  const whereClauses = [];
  const queryParams = [];

  if (search) {
    whereClauses.push(`(t.nombre LIKE ? OR t.apellidos LIKE ? OR t.email LIKE ?)`);
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }
  if (centros) {
    const centrosIds = centros.split(',').map(id => parseInt(id, 10));
    whereClauses.push(`t.centro_id IN (?)`);
    queryParams.push(centrosIds);
  }
  if (puestos) {
    const puestosIds = puestos.split(',').map(id => parseInt(id, 10));
    whereClauses.push(`t.puesto_id IN (?)`);
    queryParams.push(puestosIds);
  }
  
  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }
  query += ` ORDER BY t.apellidos, t.nombre`;

  try {
    const [trabajadores] = await pool.query(query, queryParams);
    res.json(trabajadores);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ message: 'Error del servidor al obtener trabajadores.' });
  }
};

const createTrabajador = async (req, res) => {
  const { nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, estado, fecha_alta } = req.body;
  if (!nombre || !apellidos) {
    return res.status(400).json({ message: 'El nombre y los apellidos son obligatorios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO trabajadores (nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, estado, fecha_alta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, email, telefono, puesto_id || null, sede_id || null, centro_id || null, estado, fecha_alta]
    );
    res.status(201).json({ id: result.insertId, message: 'Trabajador creado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor al crear el trabajador.' });
  }
};

const updateTrabajador = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, estado, fecha_alta, fecha_baja } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE trabajadores SET nombre = ?, apellidos = ?, email = ?, telefono = ?, puesto_id = ?, sede_id = ?, centro_id = ?, estado = ?, fecha_alta = ?, fecha_baja = ? WHERE id = ?',
      [nombre, apellidos, email, telefono, puesto_id || null, sede_id || null, centro_id || null, estado, fecha_alta, fecha_baja, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Trabajador no encontrado.' });
    res.json({ message: 'Trabajador actualizado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor al actualizar el trabajador.' });
  }
};

const deleteTrabajador = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM trabajadores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Trabajador no encontrado.' });
    res.json({ message: 'Trabajador eliminado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor al eliminar el trabajador.' });
  }
};

// 👇 La corrección está aquí. Exportamos todas las funciones en un solo bloque.
export {
  getAllTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador
};