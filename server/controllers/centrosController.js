import pool from '../config/database.js';

export const getAllCentros = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id, c.nombre_centro, c.localidad, c.provincia,
        t.codigo as territorio_codigo, tc.nombre_completo as tipo_centro
      FROM centros c
      LEFT JOIN territorios t ON c.territorio_id = t.id
      LEFT JOIN tipo_centro tc ON c.tipo_centro_id = tc.id
      ORDER BY c.nombre_centro;
    `;
    const [centros] = await pool.query(query);
    res.json(centros);
  } catch (error) { 
    console.error("Error al obtener los centros:", error);
    res.status(500).json({ message: 'Error del servidor al obtener los centros.' }); 
  }
};

export const getCentroDetails = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const centroQuery = `SELECT c.*, t.codigo as territorio_codigo, tc.nombre_completo as tipo_centro FROM centros c LEFT JOIN territorios t ON c.territorio_id = t.id LEFT JOIN tipo_centro tc ON c.tipo_centro_id = tc.id WHERE c.id = ?;`;
    const [centros] = await conn.query(centroQuery, [id]);
    if (centros.length === 0) {
      return res.status(404).json({ message: 'Centro no encontrado.' });
    }
    const centroDetails = centros[0];
    const proveedoresQuery = `
      SELECT 
        cp.id, cp.categoria, cp.detalles,
        p.nombre_proveedor, p.url_proveedor,
        a.nombre_aplicacion,
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', pc.id, 'nombre', pc.nombre, 'cargo', pc.cargo, 'email', pc.email, 'telefono', pc.telefono, 'observaciones', pc.observaciones)
          )
         FROM aplicacion_contactos ac
         JOIN proveedor_contactos pc ON ac.contacto_id = pc.id
         WHERE ac.aplicacion_id = cp.aplicacion_id) as aplicacion_contactos
      FROM centro_proveedor cp
      LEFT JOIN proveedores p ON cp.proveedor_id = p.id
      LEFT JOIN aplicaciones a ON cp.aplicacion_id = a.id
      WHERE cp.centro_id = ?
      ORDER BY cp.categoria, p.nombre_proveedor;
    `;
    const [proveedores] = await conn.query(proveedoresQuery, [id]);
    const proveedoresProcesados = proveedores.map(p => ({
      ...p,
      detalles: typeof p.detalles === 'string' ? JSON.parse(p.detalles) : p.detalles,
      aplicacion_contactos: p.aplicacion_contactos ? JSON.parse(p.aplicacion_contactos) : []
    }));
    res.json({ ...centroDetails, servicios: proveedoresProcesados });
  } catch (error) {
    console.error("Error al obtener los detalles del centro:", error);
    res.status(500).json({ message: 'Error del servidor.' });
  } finally {
    if (conn) conn.release();
  }
};

export const createCentro = async (req, res) => {
  const { nombre_centro, direccion, codigo_postal, localidad, provincia, territorio_id, tipo_centro_id, observaciones, repositorio_fotografico } = req.body;
  if (!nombre_centro) {
    return res.status(400).json({ message: 'El nombre del centro es requerido.' });
  }
  try {
    const query = `
      INSERT INTO centros (nombre_centro, direccion, codigo_postal, localidad, provincia, territorio_id, tipo_centro_id, observaciones, repositorio_fotografico) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      nombre_centro, direccion, codigo_postal, localidad, provincia,
      territorio_id || null, tipo_centro_id || null, observaciones, repositorio_fotografico
    ]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Error al crear el centro:", error);
    res.status(500).json({ message: 'Error del servidor al crear el centro.' });
  }
};

export const updateCentro = async (req, res) => {
  const { id } = req.params;
  const { nombre_centro, direccion, codigo_postal, localidad, provincia, territorio_id, tipo_centro_id, observaciones, repositorio_fotografico } = req.body;
  if (!nombre_centro) {
    return res.status(400).json({ message: 'El nombre del centro es requerido.' });
  }
  try {
    const query = `
      UPDATE centros SET 
        nombre_centro = ?, direccion = ?, codigo_postal = ?, localidad = ?, provincia = ?,
        territorio_id = ?, tipo_centro_id = ?, observaciones = ?, repositorio_fotografico = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [
      nombre_centro, direccion, codigo_postal, localidad, provincia,
      territorio_id || null, tipo_centro_id || null, observaciones, repositorio_fotografico,
      id
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Centro no encontrado.' });
    }
    res.json({ message: 'Centro actualizado con éxito.' });
  } catch (error) {
    console.error("Error al actualizar el centro:", error);
    res.status(500).json({ message: 'Error del servidor al actualizar el centro.' });
  }
};

export const deleteCentro = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM centros WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Centro no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar. Este centro tiene trabajadores o proveedores asignados.' });
    }
    res.status(500).json({ message: 'Error del servidor al eliminar el centro.' });
  }
};

export const getDirectoresByCentro = async (req, res) => {
  const { id } = req.params;
  try {
    const puestoIdDirector = 12; // El ID del puesto "Director/a de Centro"
    const query = `
      SELECT id, nombre, apellidos, email, telefono
      FROM trabajadores
      WHERE centro_id = ? AND puesto_id = ? AND estado = 'Alta';
    `;
    const [directores] = await pool.query(query, [id, puestoIdDirector]);
    res.json(directores);
  } catch (error) {
    console.error("Error al obtener los directores del centro:", error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};