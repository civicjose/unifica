import pool from '../config/database.js';
import Papa from 'papaparse';

// Función auxiliar para normalizar fechas, crucial para la comparación en el historial
const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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

  // --- LÓGICA DE BÚSQUEDA CORREGIDA ---
  if (search) {
    const searchTerms = search.split(' ').filter(term => term.length > 0);
    searchTerms.forEach(term => {
      const searchTerm = `%${term}%`;
      whereClauses.push(
        `(
          CONCAT(t.nombre, ' ', t.apellidos) LIKE ? OR
          t.email LIKE ? OR
          p.nombre_puesto LIKE ? OR
          COALESCE(s.nombre_sede, c.nombre_centro) LIKE ? OR
          ter.codigo LIKE ?
        )`
      );
      // Añade el parámetro para cada '?' en la cláusula
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    });
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
      "SELECT *, DATE_FORMAT(fecha_alta, '%Y-%m-%d') as fecha_alta, DATE_FORMAT(fecha_baja, '%Y-%m-%d') as fecha_baja FROM trabajadores WHERE id = ?", [id]
    );

    if (trabajadoresActuales.length === 0) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ message: 'Trabajador no encontrado.' });
    }
    const datosAnteriores = trabajadoresActuales[0];

    // --- CORRECCIÓN 1: Se cambia 'const' por 'let' para permitir la modificación ---
    let { nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, territorio_id, estado, fecha_alta, fecha_baja, observaciones } = datosNuevos;
    
    // --- CORRECCIÓN 2: Esta lógica se ejecuta ANTES de la consulta UPDATE ---
    if (estado === 'Alta') {
      fecha_baja = null;
    }
    
    await conn.query(
      'UPDATE trabajadores SET nombre = ?, apellidos = ?, email = ?, telefono = ?, puesto_id = ?, sede_id = ?, centro_id = ?, departamento_id = ?, territorio_id = ?, estado = ?, fecha_alta = ?, fecha_baja = ?, observaciones = ? WHERE id = ?',
      [nombre, apellidos, email, telefono, puesto_id || null, sede_id || null, centro_id || null, departamento_id || null, territorio_id || null, estado, fecha_alta || null, fecha_baja, observaciones, id]
    );

    for (const campo in datosNuevos) {
      if (datosNuevos.sede_id && campo === 'centro_id') continue;
      if (datosNuevos.centro_id && (campo === 'sede_id' || campo === 'departamento_id')) continue;

      let valorAnterior = datosAnteriores[campo];
      let valorNuevo = datosNuevos[campo];
      
      let valorAnteriorComparable = valorAnterior ?? null;
      let valorNuevoComparable = valorNuevo ?? null;

      // Se normalizan las fechas para una comparación precisa en el historial
      if (campo === 'fecha_alta' || campo === 'fecha_baja') {
        valorAnteriorComparable = normalizeDate(valorAnterior);
        valorNuevoComparable = normalizeDate(valorNuevo);
      }
      
      if (String(valorAnteriorComparable) !== String(valorNuevoComparable)) {
        if ((valorAnteriorComparable === null || valorAnteriorComparable === '') && (valorNuevoComparable === null || valorNuevoComparable === '')) {
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
            delimiter: ";", // Asegúrate de que tu CSV usa comas
        });
        
        // Error mejorado y coherente con el delimitador usado.
        if (results.errors.some(e => e.code === 'MissingHeader' || results.data.length === 0)) {
            throw new Error('El delimitador del CSV parece incorrecto o el archivo está mal formado. Por favor, revisa que las columnas estén separadas por comas (,).');
        }

        await conn.beginTransaction();

        for (const [index, row] of results.data.entries()) {
            const rowNumber = index + 2; // +2 para contar la cabecera

            // 1. Validar y obtener el puesto_id
            if (!row.puesto || row.puesto.trim() === '') {
                throw new Error(`El campo 'puesto' está vacío en la fila ${rowNumber}.`);
            }
            const [puesto] = await conn.query('SELECT id FROM puestos WHERE nombre_puesto = ?', [row.puesto.trim()]);
            if (puesto.length === 0) {
                throw new Error(`El puesto '${row.puesto}' no existe en la base de datos. Fila ${rowNumber} del CSV.`);
            }
            const puesto_id = puesto[0].id;

            // 2. Validar y obtener sede_id o centro_id
            let sede_id = null;
            let centro_id = null;
            if (row.ubicacion && row.ubicacion.trim() !== '') {
                const ubicacion = row.ubicacion.trim();
                const [sede] = await conn.query('SELECT id FROM sedes WHERE nombre_sede = ?', [ubicacion]);
                if (sede.length > 0) {
                    sede_id = sede[0].id;
                } else {
                    const [centro] = await conn.query('SELECT id FROM centros WHERE nombre_centro = ?', [ubicacion]);
                    if (centro.length > 0) {
                        centro_id = centro[0].id;
                    } else {
                        // Opcional: podrías decidir no lanzar un error y simplemente dejar la ubicación en null con un warning.
                        // Por ahora, mantenemos la validación estricta.
                        throw new Error(`La ubicación '${ubicacion}' no existe como Sede ni como Centro. Fila ${rowNumber} del CSV.`);
                    }
                }
            }

            // 3. Validar y obtener departamento_id (LÓGICA CORREGIDA)
            // Se busca el departamento si existe en el CSV, sin depender de si hay una sede.
            let departamento_id = null;
            if (row.departamento && row.departamento.trim() !== '') {
                const departamento = row.departamento.trim();
                const [depto] = await conn.query('SELECT id FROM departamentos WHERE nombre = ?', [departamento]);
                if (depto.length === 0) {
                    throw new Error(`El departamento '${departamento}' no existe en la base de datos. Fila ${rowNumber} del CSV.`);
                }
                departamento_id = depto[0].id;
            }
            
            // 4. Lógica de Inserción o Actualización (UPSERT)
            // Si el email ya existe, actualiza el registro. Si no, lo inserta.
            // Esto evita errores de clave única 'email'.
            const email = row.email && row.email.trim() !== '' ? row.email.trim() : null;
            if (!email) {
                // Si se requiere email, se puede lanzar un error. Si no, se puede insertar sin él.
                // Asumimos que un trabajador puede no tener email por ahora.
            }

            const values = {
                nombre: row.nombre,
                apellidos: row.apellidos,
                email: email,
                telefono: row.telefono || null,
                puesto_id: puesto_id,
                sede_id: sede_id,
                centro_id: centro_id,
                departamento_id: departamento_id,
                estado: row.estado || 'Alta',
                fecha_alta: row.fecha_alta || null,
                fecha_baja: row.fecha_baja || null,
                observaciones: row.observaciones || null
            };

            // Se usa INSERT ... ON DUPLICATE KEY UPDATE para manejar emails existentes.
            // El email debe ser una clave UNIQUE en tu tabla para que esto funcione.
            await conn.query(
              `INSERT INTO trabajadores (nombre, apellidos, email, telefono, puesto_id, sede_id, centro_id, departamento_id, estado, fecha_alta, fecha_baja, observaciones) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
               nombre=VALUES(nombre), apellidos=VALUES(apellidos), telefono=VALUES(telefono), puesto_id=VALUES(puesto_id),
               sede_id=VALUES(sede_id), centro_id=VALUES(centro_id), departamento_id=VALUES(departamento_id), estado=VALUES(estado),
               fecha_alta=VALUES(fecha_alta), fecha_baja=VALUES(fecha_baja), observaciones=VALUES(observaciones)`,
              [...Object.values(values)]
            );
        }

        await conn.commit();
        res.json({ message: `${results.data.length} trabajadores importados o actualizados con éxito.` });

    } catch (error) {
        await conn.rollback();
        // Es buena práctica loguear el error completo en el servidor.
        console.error('Error durante la importación de trabajadores:', error);
        // Y enviar un mensaje claro al cliente.
        res.status(400).json({ message: error.message || 'Error en la importación. Ningún dato fue guardado.' });
    } finally {
        if (conn) conn.release();
    }
};

const getDirectoresDeCentro = async (req, res) => {
  try {
    const puestoIdDirector = 12; // ID del puesto "Director/a de Centro"
    const [directores] = await pool.query(
      'SELECT id, nombre, apellidos FROM trabajadores WHERE puesto_id = ? AND estado = "Alta" ORDER BY apellidos, nombre',
      [puestoIdDirector]
    );
    res.json(directores);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener los directores.' });
  }
};

export {
  getAllTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
  importTrabajadores,
  getDirectoresDeCentro
};