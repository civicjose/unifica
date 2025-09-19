import pool from '../config/database.js';
import graphHelper from '../utils/graphHelper.js';
import Papa from 'papaparse';

export const getGastos = async (req, res) => {
  const { sede_id, centro_id, fecha_inicio, fecha_fin } = req.query;
  if (!sede_id && !centro_id) return res.status(400).json({ message: 'Se requiere un ID de sede o de centro.' });

  let query = `
    SELECT 
      g.id, g.concepto, g.importe, DATE_FORMAT(g.fecha, '%Y-%m-%d') as fecha, 
      g.sede_id, g.centro_id, g.factura_url, g.proveedor_id,
      g.tipo_pago, DATE_FORMAT(g.fecha_fin_renovacion, '%Y-%m-%d') as fecha_fin_renovacion,
      g.trabajador_id,
      p.nombre_proveedor,
      t.codigo as territorio_codigo,
      tc.nombre_completo as tipo_centro_nombre,
      CONCAT(trab.nombre, ' ', trab.apellidos) as trabajador_nombre
    FROM gastos g
    LEFT JOIN proveedores p ON g.proveedor_id = p.id
    LEFT JOIN territorios t ON g.territorio_id = t.id
    LEFT JOIN centros c ON g.centro_id = c.id
    LEFT JOIN tipo_centro tc ON c.tipo_centro_id = tc.id
    LEFT JOIN trabajadores trab ON g.trabajador_id = trab.id
    WHERE
  `;
  const params = [];

  if (sede_id) {
    query += ' g.sede_id = ?';
    params.push(sede_id);
  } else {
    query += ' g.centro_id = ?';
    params.push(centro_id);
  }

  if (fecha_inicio && fecha_fin) {
    query += ' AND g.fecha BETWEEN ? AND ?';
    params.push(fecha_inicio, fecha_fin);
  }
  
  query += ' ORDER BY g.fecha DESC';

  try {
    const [gastos] = await pool.query(query, params);
    const gastosLimpios = gastos.map(g => ({
        ...g,
        fecha_fin_renovacion: g.fecha_fin_renovacion === '0000-00-00' ? null : g.fecha_fin_renovacion
    }));
    res.json(gastosLimpios);
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    res.status(500).json({ message: 'Error del servidor al obtener los gastos.' });
  }
};

export const createGasto = async (req, res) => {
  const facturaFile = req.file;
  const { concepto, importe, fecha, sede_id, centro_id, proveedor_id, tipo_pago, fecha_fin_renovacion, trabajador_id } = req.body;
  
  if (!concepto || !importe || !fecha || (!sede_id && !centro_id)) return res.status(400).json({ message: 'Faltan campos requeridos.' });

  const conn = await pool.getConnection();
  let factura_url = null;
  let territorio_id = null;
  let tipo_centro_id = null;

  try {
    await conn.beginTransaction();
    
    let nombreUbicacion = '';
    if (sede_id) {
        const [sedes] = await conn.query('SELECT nombre_sede, territorio_id FROM sedes WHERE id = ?', [sede_id]);
        if (sedes.length > 0) {
            nombreUbicacion = sedes[0].nombre_sede;
            territorio_id = sedes[0].territorio_id;
        }
    } else if (centro_id) {
        const [centros] = await conn.query('SELECT nombre_centro, territorio_id, tipo_centro_id FROM centros WHERE id = ?', [centro_id]);
        if (centros.length > 0) {
            nombreUbicacion = centros[0].nombre_centro;
            territorio_id = centros[0].territorio_id;
            tipo_centro_id = centros[0].tipo_centro_id;
        }
    }
    if (!nombreUbicacion) throw new Error('No se encontró la sede o centro para asociar el gasto.');

    if (facturaFile) {
      const fechaGasto = new Date(fecha);
      const year = fechaGasto.getFullYear();
      const month = String(fechaGasto.getMonth() + 1).padStart(2, '0');
      const nombreCarpeta = nombreUbicacion.replace(/[/\\?%*:|"<>]/g, '-');
      const oneDrivePath = `Unifica/${nombreCarpeta}/${year}/${month}`;
      factura_url = await graphHelper.uploadFileAndGetUrl(oneDrivePath, facturaFile.originalname, facturaFile.buffer);
    }

    const [result] = await conn.query(
      `INSERT INTO gastos (concepto, importe, fecha, sede_id, centro_id, factura_url, proveedor_id, territorio_id, tipo_pago, fecha_fin_renovacion, tipo_centro_id, trabajador_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [concepto, importe, fecha, sede_id || null, centro_id || null, factura_url, proveedor_id || null, territorio_id, tipo_pago, fecha_fin_renovacion || null, tipo_centro_id || null, trabajador_id || null]
    );

    await conn.commit();
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    await conn.rollback();
    console.error("Error al crear el gasto:", error);
    res.status(500).json({ message: error.message || 'Error del servidor al crear el gasto.' });
  } finally {
    conn.release();
  }
};

export const updateGasto = async (req, res) => {
    const { id } = req.params;
    const facturaFile = req.file;
    const { concepto, importe, fecha, proveedor_id, tipo_pago, fecha_fin_renovacion, trabajador_id } = req.body;

    if (!concepto || !importe || !fecha) return res.status(400).json({ message: 'Faltan campos requeridos.' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [currentGasto] = await conn.query('SELECT factura_url, sede_id, centro_id FROM gastos WHERE id = ?', [id]);
        if (currentGasto.length === 0) return res.status(404).json({ message: 'Gasto no encontrado.' });
        
        let factura_url = currentGasto[0].factura_url;
        const actual_sede_id = currentGasto[0].sede_id;
        const actual_centro_id = currentGasto[0].centro_id;
        let territorio_id = null;
        let tipo_centro_id = null;
        let nombreUbicacion = '';

        if (actual_sede_id) {
            const [sedes] = await conn.query('SELECT nombre_sede, territorio_id FROM sedes WHERE id = ?', [actual_sede_id]);
            if (sedes.length > 0) {
                nombreUbicacion = sedes[0].nombre_sede;
                territorio_id = sedes[0].territorio_id;
            }
        } else if (actual_centro_id) {
            const [centros] = await conn.query('SELECT nombre_centro, territorio_id, tipo_centro_id FROM centros WHERE id = ?', [actual_centro_id]);
            if (centros.length > 0) {
                nombreUbicacion = centros[0].nombre_centro;
                territorio_id = centros[0].territorio_id;
                tipo_centro_id = centros[0].tipo_centro_id;
            }
        }

        if (facturaFile && nombreUbicacion) {
            const fechaGasto = new Date(fecha);
            const year = fechaGasto.getFullYear();
            const month = String(fechaGasto.getMonth() + 1).padStart(2, '0');
            const nombreCarpeta = nombreUbicacion.replace(/[/\\?%*:|"<>]/g, '-');
            const oneDrivePath = `Unifica/${nombreCarpeta}/${year}/${month}`;
            factura_url = await graphHelper.uploadFileAndGetUrl(oneDrivePath, facturaFile.originalname, facturaFile.buffer);
        }
        
        await conn.query(
            'UPDATE gastos SET concepto = ?, importe = ?, fecha = ?, factura_url = ?, proveedor_id = ?, tipo_pago = ?, fecha_fin_renovacion = ?, territorio_id = ?, tipo_centro_id = ?, trabajador_id = ? WHERE id = ?',
            [concepto, importe, fecha, factura_url, proveedor_id || null, tipo_pago, fecha_fin_renovacion || null, territorio_id, tipo_centro_id, trabajador_id || null, id]
        );

        await conn.commit();
        res.status(200).json({ message: 'Gasto actualizado con éxito.' });
    } catch (error) {
        await conn.rollback();
        console.error("Error al actualizar el gasto:", error);
        res.status(500).json({ message: error.message || 'Error del servidor al actualizar el gasto.' });
    } finally {
        conn.release();
    }
};

export const deleteGasto = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM gastos WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Gasto no encontrado.' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor al eliminar el gasto.' });
    }
};

export const exportGastos = async (req, res) => {
    const { sede_id, centro_id, fecha_inicio, fecha_fin } = req.query;

    if (!sede_id && !centro_id) return res.status(400).json({ message: 'Se requiere un ID de sede o de centro.' });

    let query = `
      SELECT g.fecha, g.concepto, p.nombre_proveedor, g.importe, g.tipo_pago, g.fecha_fin_renovacion 
      FROM gastos g
      LEFT JOIN proveedores p ON g.proveedor_id = p.id
      WHERE
    `;
    const params = [];

    if (sede_id) {
        query += ' g.sede_id = ?';
        params.push(sede_id);
    } else {
        query += ' g.centro_id = ?';
        params.push(centro_id);
    }

    if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
    }
    query += ' ORDER BY g.fecha ASC';

    try {
        const [gastos] = await pool.query(query, params);

        if (gastos.length === 0) return res.status(404).json({ message: 'No hay gastos para exportar con los filtros seleccionados.' });
        
        const datosParaCsv = gastos.map(g => ({
            'Fecha Gasto': new Date(g.fecha).toLocaleDateString('es-ES'),
            'Concepto': g.concepto,
            'Proveedor': g.nombre_proveedor,
            'Tipo de Pago': g.tipo_pago,
            'Importe': parseFloat(g.importe).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Fecha Fin/Renovación': g.fecha_fin_renovacion ? new Date(g.fecha_fin_renovacion).toLocaleDateString('es-ES') : ''
        }));

        const csv = Papa.unparse(datosParaCsv, { delimiter: ";" });

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('export_gastos.csv');
        res.send("\uFEFF" + csv);

    } catch (error) {
        console.error("Error al exportar gastos:", error);
        res.status(500).json({ message: 'Error del servidor al exportar los gastos.' });
    }
};