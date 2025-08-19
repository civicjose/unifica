import pool from '../config/database.js';
import Papa from 'papaparse';


const getAllTrabajadores = async (req, res) => {
  const { search, sedes, centros, puestos, estado, territorios } = req.query;
  let query = `
    SELECT 
      t.id, t.nombre, t.apellidos, t.email, t.telefono, 
      t.estado, 
      DATE_FORMAT(t.fecha_alta, '%Y-%m-%d') as fecha_alta, 
      DATE_FORMAT(t.fecha_baja, '%Y-%m-%d') as fecha_baja, 
      t.observaciones,
      p.nombre_puesto as puesto, p.id as puesto_id,
      COALESCE(s.nombre_sede, c.nombre_centro) AS ubicacion,
      t.sede_id, t.centro_id,
      d.nombre as departamento, t.departamento_id,
      ter.codigo as territorio,
      t.territorio_id
    FROM trabajadores t
    LEFT JOIN puestos p ON t.puesto_id = p.id
    LEFT JOIN sedes s ON t.sede_id = s.id
    LEFT JOIN centros c ON t.centro_id = c.id
    LEFT JOIN departamentos d ON t.departamento_id = d.id
    LEFT JOIN territorios ter ON t.territorio_id = ter.id
  `;
  const whereClauses = [];
  const queryParams = [];
  if (search) {
    whereClauses.push(`(t.nombre LIKE ? OR t.apellidos LIKE ? OR t.email LIKE ? OR p.nombre_puesto LIKE ? OR COALESCE(s.nombre_sede, c.nombre_centro) LIKE ? OR ter.codigo LIKE ?)`);
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  const sedeIds = sedes ? sedes.split(',').map(id => parseInt(id, 10)) : [];
  const centroIds = centros ? centros.split(',').map(id => parseInt(id, 10)) : [];
  if (sedeIds.length > 0 || centroIds.length > 0) {
    const ubicacionClauses = [];
    if (sedeIds.length > 0) {
      ubicacionClauses.push(`t.sede_id IN (?)`);
      queryParams.push(sedeIds);
    }
    if (centroIds.length > 0) {
      ubicacionClauses.push(`t.centro_id IN (?)`);
      queryParams.push(centroIds);
    }
    whereClauses.push(`(${ubicacionClauses.join(' OR ')})`);
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
  if (territorios) {
    const territorioIds = territorios.split(',').map(id => parseInt(id, 10));
    whereClauses.push(`t.territorio_id IN (?)`);
    queryParams.push(territorioIds);
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
  const datosNuevos = req.body;
  const usuarioId = req.user.id;

  if (datosNuevos.sede_id && datosNuevos.centro_id) {
    return res.status(400).json({ message: 'Un trabajador solo puede pertenecer a una sede O a un centro, no a ambos.' });
  }
  if (!datosNuevos.nombre || !datosNuevos.apellidos) {
    return res.status(400).json({ message: 'El nombre y los apellidos son obligatorios.' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    
    const { nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, territorio_id, estado, fecha_alta, observaciones } = datosNuevos;

    const [result] = await conn.query(
      'INSERT INTO trabajadores (nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, territorio_id, estado, fecha_alta, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, email, telefono, puesto_id || null, sede_id || null, centro_id || null, departamento_id || null, territorio_id || null, estado, fecha_alta || null, observaciones]
    );
    const nuevoTrabajadorId = result.insertId;

    for (const campo in datosNuevos) {
        const valorNuevo = datosNuevos[campo] ?? null;
        if (valorNuevo !== null && valorNuevo !== '') {
            await conn.query(
              'INSERT INTO historial_modificaciones (usuario_modificador_id, tipo_accion, entidad_modificada, id_entidad_modificada, campo_modificado, valor_anterior, valor_nuevo) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [usuarioId, 'CREATE', 'trabajadores', nuevoTrabajadorId, campo, null, valorNuevo]
            );
        }
    }

    await conn.commit();
    res.status(201).json({ id: nuevoTrabajadorId, message: 'Trabajador creado con éxito.' });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error del servidor al crear el trabajador.' });
  } finally {
    conn.release();
  }
};


const updateTrabajador = async (req, res) => {
  const { id } = req.params;
  const datosNuevos = req.body;
  const usuarioId = req.user.id;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [trabajadoresActuales] = await conn.query(
      "SELECT id, nombre, apellidos, email, telefono, estado, DATE_FORMAT(fecha_alta, '%Y-%m-%d') as fecha_alta, DATE_FORMAT(fecha_baja, '%Y-%m-%d') as fecha_baja, observaciones, puesto_id, sede_id, centro_id, departamento_id, territorio_id FROM trabajadores WHERE id = ?", [id]
    );

    if (trabajadoresActuales.length === 0) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ message: 'Trabajador no encontrado.' });
    }
    const datosAnteriores = trabajadoresActuales[0];

    const { nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, territorio_id, estado, fecha_alta, fecha_baja, observaciones } = datosNuevos;
    
    await conn.query(
      'UPDATE trabajadores SET nombre = ?, apellidos = ?, email = ?, telefono = ?, puesto_id = ?, sede_id = ?, centro_id = ?, departamento_id = ?, territorio_id = ?, estado = ?, fecha_alta = ?, fecha_baja = ?, observaciones = ? WHERE id = ?',
      [nombre, apellidos, email, telefono, puesto_id || null, sede_id || null, centro_id || null, departamento_id || null, territorio_id || null, estado, fecha_alta || null, fecha_baja || null, observaciones, id]
    );

    if (estado === 'Alta') {
      fecha_baja = null;
    }

    for (const campo in datosNuevos) {
      if (datosNuevos.sede_id && campo === 'centro_id') continue;
      if (datosNuevos.centro_id && (campo === 'sede_id' || campo === 'departamento_id')) continue;

      // 3. Ahora la comparación es directa entre strings 'YYYY-MM-DD'
      const valorAnterior = datosAnteriores[campo] ?? null;
      const valorNuevo = datosNuevos[campo] ?? null;
      
      if (String(valorAnterior) !== String(valorNuevo)) {
        if ((valorAnterior === null || valorAnterior === '') && (valorNuevo === null || valorNuevo === '')) {
            continue;
        }

        await conn.query(
          'INSERT INTO historial_modificaciones (usuario_modificador_id, tipo_accion, entidad_modificada, id_entidad_modificada, campo_modificado, valor_anterior, valor_nuevo) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [usuarioId, 'UPDATE', 'trabajadores', id, campo, valorAnterior, valorNuevo]
        );
      }
    }

    await conn.commit();
    res.json({ message: 'Trabajador actualizado con éxito.' });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error del servidor al actualizar el trabajador.' });
  } finally {
    conn.release();
  }
};
// ... (deleteTrabajador e importTrabajadores no cambian)
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
      delimiter: ",",
    });
    
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