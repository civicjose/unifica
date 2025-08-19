import pool from '../config/database.js';

// GET /api/sedes - Obtener todas las sedes para la lista principal
export const getAllSedes = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id, s.nombre_sede, s.localidad, s.provincia, t.codigo as territorio_codigo
      FROM sedes s
      LEFT JOIN territorios t ON s.territorio_id = t.id
      ORDER BY s.nombre_sede;
    `;
    const [sedes] = await pool.query(query);
    res.json(sedes);
  } catch (error) { 
    res.status(500).json({ message: 'Error del servidor al obtener las sedes.' }); 
  }
};

// GET /api/sedes/:id - Obtener los datos de una sede para el modal de edición
export const getSedeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [sedes] = await pool.query('SELECT * FROM sedes WHERE id = ?', [id]);
    if (sedes.length === 0) {
      return res.status(404).json({ message: 'Sede no encontrada.' });
    }
    res.json(sedes[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los detalles de la sede.' });
  }
};

// GET /api/sedes/:id/details - Obtiene todos los detalles de una sede para la ficha
export const getSedeDetails = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const [sedes] = await conn.query('SELECT s.*, t.codigo as territorio_codigo FROM sedes s LEFT JOIN territorios t ON s.territorio_id = t.id WHERE s.id = ?', [id]);
    if (sedes.length === 0) {
      return res.status(404).json({ message: 'Sede no encontrada.' });
    }
    const sedeDetails = sedes[0];

    const proveedoresQuery = `
      SELECT 
        sp.id, sp.categoria, sp.detalles, sp.proveedor_id, sp.aplicacion_id,
        p.nombre_proveedor, p.url_proveedor,
        a.nombre_aplicacion,
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', pc.id, 'nombre', pc.nombre, 'cargo', pc.cargo, 'email', pc.email, 'telefono', pc.telefono, 'observaciones', pc.observaciones)
          )
         FROM aplicacion_contactos ac
         JOIN proveedor_contactos pc ON ac.contacto_id = pc.id
         WHERE ac.aplicacion_id = sp.aplicacion_id) as aplicacion_contactos
      FROM sede_proveedor sp
      LEFT JOIN proveedores p ON sp.proveedor_id = p.id
      LEFT JOIN aplicaciones a ON sp.aplicacion_id = a.id
      WHERE sp.sede_id = ? ORDER BY sp.categoria;
    `;
    const [proveedores] = await conn.query(proveedoresQuery, [id]);

    const proveedoresProcesados = proveedores.map(p => ({
      ...p,
      detalles: typeof p.detalles === 'string' ? JSON.parse(p.detalles) : p.detalles,
      aplicacion_contactos: p.aplicacion_contactos ? JSON.parse(p.aplicacion_contactos) : []
    }));

    res.json({ ...sedeDetails, proveedores: proveedoresProcesados });
  } catch (error) {
    console.error("Error al obtener detalles de la sede:", error);
    res.status(500).json({ message: 'Error al obtener los detalles de la sede.' });
  } finally {
    if (conn) conn.release();
  }
};

// POST /api/sedes - Crear una nueva sede
export const createSede = async (req, res) => {
  const { nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id, observaciones, repositorio_fotografico } = req.body;
  if (!nombre_sede) {
    return res.status(400).json({ message: 'El nombre de la sede es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO sedes (nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id, observaciones, repositorio_fotografico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id || null, observaciones, repositorio_fotografico]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al crear la sede.' });
  }
};

// PUT /api/sedes/:id - Actualizar una sede
export const updateSede = async (req, res) => {
  const { id } = req.params;
  const { nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id, observaciones, repositorio_fotografico } = req.body;
  if (!nombre_sede) {
    return res.status(400).json({ message: 'El nombre de la sede es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE sedes SET nombre_sede = ?, direccion = ?, codigo_postal = ?, localidad = ?, provincia = ?, telefono = ?, territorio_id = ?, observaciones = ?, repositorio_fotografico = ? WHERE id = ?',
      [nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id || null, observaciones, repositorio_fotografico, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sede no encontrada.' });
    }
    res.json({ message: 'Sede actualizada con éxito.' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar la sede.' });
  }
};

// DELETE /api/sedes/:id - Eliminar una sede
export const deleteSede = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM sedes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sede no encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar. Esta sede tiene trabajadores asignados.' });
    }
    res.status(500).json({ message: 'Error del servidor al eliminar la sede.' });
  }
};