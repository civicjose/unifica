import pool from '../config/database.js';
import Papa from 'papaparse';

// --- (El resto de funciones: getAll, create, update, delete no cambian) ---
const getAllTrabajadores = async (req, res) => {
  const { search, sedes, centros, puestos, estado } = req.query;
  let query = `
    SELECT 
      t.id, t.nombre, t.apellidos, t.email, t.telefono, 
      t.estado, t.fecha_alta, t.fecha_baja, t.observaciones,
      p.nombre_puesto as puesto, p.id as puesto_id,
      COALESCE(s.nombre_sede, c.nombre_centro) AS ubicacion,
      t.sede_id, t.centro_id,
      d.nombre as departamento, t.departamento_id
    FROM trabajadores t
    LEFT JOIN puestos p ON t.puesto_id = p.id
    LEFT JOIN sedes s ON t.sede_id = s.id
    LEFT JOIN centros c ON t.centro_id = c.id
    LEFT JOIN departamentos d ON t.departamento_id = d.id
  `;
  const whereClauses = [];
  const queryParams = [];
  if (search) {
    whereClauses.push(`(t.nombre LIKE ? OR t.apellidos LIKE ? OR t.email LIKE ? OR p.nombre_puesto LIKE ? OR s.nombre_sede LIKE ? OR c.nombre_centro LIKE ?)`);
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  const sedeIds = sedes ? sedes.split(',').map(id => parseInt(id, 10)) : [];
  const centroIds = centros ? centros.split(',').map(id => parseInt(id, 10)) : [];
  if (sedeIds.length > 0 && centroIds.length > 0) {
    whereClauses.push(`(t.sede_id IN (?) OR t.centro_id IN (?))`);
    queryParams.push(sedeIds, centroIds);
  } else if (sedeIds.length > 0) {
    whereClauses.push(`t.sede_id IN (?)`);
    queryParams.push(sedeIds);
  } else if (centroIds.length > 0) {
    whereClauses.push(`t.centro_id IN (?)`);
    queryParams.push(centroIds);
  }
  if (puestos) {
    const puestosIds = puestos.split(',').map(id => parseInt(id, 10));
    whereClauses.push(`t.puesto_id IN (?)`);
    queryParams.push(puestosIds);
  }
  if (estado && (estado === 'Alta' || estado === 'Baja')) {
    whereClauses.push(`t.estado = ?`);
    queryParams.push(estado);
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
  const { nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, estado, fecha_alta, observaciones } = req.body;
  if (sede_id && centro_id) {
    return res.status(400).json({ message: 'Un trabajador solo puede pertenecer a una sede O a un centro, no a ambos.' });
  }
  if (!nombre || !apellidos) {
    return res.status(400).json({ message: 'El nombre y los apellidos son obligatorios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO trabajadores (nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, estado, fecha_alta, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, email, telefono, puesto_id || null, sede_id || null, centro_id || null, departamento_id || null, estado, fecha_alta || null, observaciones]
    );
    res.status(201).json({ id: result.insertId, message: 'Trabajador creado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor al crear el trabajador.' });
  }
};
const updateTrabajador = async (req, res) => {
  const { id } = req.params;
  let { nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, estado, fecha_alta, fecha_baja, observaciones } = req.body;
  if (sede_id && centro_id) {
    return res.status(400).json({ message: 'Un trabajador solo puede pertenecer a una sede O a un centro, no a ambos.' });
  }
  if (fecha_baja === '') fecha_baja = null;
  if (fecha_alta === '') fecha_alta = null;
  try {
    const [result] = await pool.query(
      'UPDATE trabajadores SET nombre = ?, apellidos = ?, email = ?, telefono = ?, puesto_id = ?, sede_id = ?, centro_id = ?, departamento_id = ?, estado = ?, fecha_alta = ?, fecha_baja = ?, observaciones = ? WHERE id = ?',
      [nombre, apellidos, email, telefono, puesto_id || null, sede_id || null, centro_id || null, departamento_id || null, estado, fecha_alta, fecha_baja, observaciones, id]
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

const importTrabajadores = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
  }

  const fileContent = req.file.buffer.toString('utf-8');
  const conn = await pool.getConnection();

  try {
    const results = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''),
      delimiter: ",", // --- CORRECCIÓN AQUÍ ---
    });

    // Si el delimitador es incorrecto, el parser devuelve un solo objeto con las cabeceras como keys vacías
    if (results.errors.some(e => e.code === 'MissingHeader')) {
        throw new Error('El delimitador del CSV es incorrecto. Por favor, usa punto y coma (;) como separador.');
    }

    await conn.beginTransaction();

    for (const [index, row] of results.data.entries()) {
      const rowNumber = index + 2;

      if (!row.puesto) {
        throw new Error(`El campo 'puesto' está vacío o la cabecera es incorrecta en la fila ${rowNumber}.`);
      }
      const [puesto] = await conn.query('SELECT id FROM puestos WHERE nombre_puesto = ?', [row.puesto]);
      if (puesto.length === 0) throw new Error(`El puesto '${row.puesto}' no existe. Fila ${rowNumber} del CSV.`);
      const puesto_id = puesto[0].id;

      let sede_id = null;
      let centro_id = null;
      if (row.ubicacion) {
        const [sede] = await conn.query('SELECT id FROM sedes WHERE nombre_sede = ?', [row.ubicacion]);
        if (sede.length > 0) {
          sede_id = sede[0].id;
        } else {
          const [centro] = await conn.query('SELECT id FROM centros WHERE nombre_centro = ?', [row.ubicacion]);
          if (centro.length > 0) {
            centro_id = centro[0].id;
          } else {
            throw new Error(`La ubicación '${row.ubicacion}' no existe como Sede ni como Centro. Fila ${rowNumber} del CSV.`);
          }
        }
      }

      let departamento_id = null;
      if (sede_id && row.departamento) {
        const [depto] = await conn.query('SELECT id FROM departamentos WHERE nombre = ?', [row.departamento]);
        if (depto.length === 0) throw new Error(`El departamento '${row.departamento}' no existe. Fila ${rowNumber} del CSV.`);
        departamento_id = depto[0].id;
      } else if (!sede_id && row.departamento) {
        throw new Error(`No se puede asignar un departamento a un trabajador que no pertenece a una sede. Fila ${rowNumber} del CSV.`);
      }
      
      await conn.query(
        `INSERT INTO trabajadores (nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, estado, fecha_alta, fecha_baja, observaciones) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.nombre, row.apellidos, row.email || null, row.telefono || null, puesto_id, sede_id, centro_id, departamento_id,
          row.estado || 'Alta', row.fecha_alta || null, row.fecha_baja || null, row.observaciones || null
        ]
      );
    }

    await conn.commit();
    res.json({ message: `${results.data.length} trabajadores importados con éxito.` });

  } catch (error) {
    await conn.rollback();
    console.error('Error durante la importación:', error);
    res.status(400).json({ message: error.message || 'Error en la importación. Ningún dato fue guardado.' });
  } finally {
    conn.release();
  }
};

export {
  getAllTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
  importTrabajadores
};