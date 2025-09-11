import pool from '../config/database.js';
import axios from 'axios';

const cleanAddressForGeocoding = (address) => {
  let cleaned = address.replace(/\s(piso|planta|puerta|local|escalera|bajo|esc|pta|pl)\.?\s?([\w-]+)?/gi, '');
  cleaned = cleaned.replace(/,\s*\d+[a-zA-Z]?\b/g, '');
  const parts = cleaned.split(',');
  if (parts.length > 2) {
      cleaned = `${parts[0]}, ${parts[1]}`;
  }
  return cleaned.trim();
};

const geocodeAddress = async (addressData) => {
  const { direccion, codigo_postal, localidad, provincia } = addressData;
  const addressParts = [direccion, codigo_postal, localidad, provincia, 'España'].filter(Boolean);
  const fullAddress = addressParts.join(', ');

  if (!fullAddress) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=jsonv2&limit=1`;
  
  console.log(`[GEOCODING] Consultando URL con axios: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'UnificaApp/1.0 (Contacto: jose.civico@macrosad.com)' },
      timeout: 7000
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coords = { lat: parseFloat(result.lat), lon: parseFloat(result.lon) };
      console.log(`[GEOCODING] ÉXITO para "${fullAddress}":`, coords);
      return coords;
    } else {
      console.log(`[GEOCODING] FALLO para "${fullAddress}": Nominatim no devolvió resultados.`);
      return null;
    }
  } catch (error) {
    console.error(`[GEOCODING] ERROR en la petición para "${fullAddress}":`, error.message);
    return null;
  }
};

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

export const createSede = async (req, res) => {
  const { nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id, observaciones, repositorio_fotografico } = req.body;
  if (!nombre_sede) {
    return res.status(400).json({ message: 'El nombre de la sede es requerido.' });
  }
  let latitud = null;
  let longitud = null;
  if (direccion && localidad && provincia) {
    const coords = await geocodeAddress({ direccion, codigo_postal, localidad, provincia });
    if (coords) {
      latitud = coords.lat;
      longitud = coords.lon;
    }
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO sedes (nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id, observaciones, repositorio_fotografico, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id || null, observaciones, repositorio_fotografico, latitud, longitud]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al crear la sede.' });
  }
};

export const updateSede = async (req, res) => {
  const { id } = req.params;
  const newData = req.body;
  if (!newData.nombre_sede) {
    return res.status(400).json({ message: 'El nombre de la sede es requerido.' });
  }

  const conn = await pool.getConnection();
  try {
    const [currentRows] = await conn.query('SELECT direccion, localidad, provincia, codigo_postal, latitud, longitud FROM sedes WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      return res.status(404).json({ message: 'Sede no encontrada.' });
    }
    
    const currentData = currentRows[0];
    let { latitud, longitud } = currentData;

    const addressHasChanged = 
      newData.direccion !== currentData.direccion ||
      newData.localidad !== currentData.localidad ||
      newData.provincia !== currentData.provincia ||
      newData.codigo_postal !== currentData.codigo_postal;
    
    if ((addressHasChanged || latitud === null) && (newData.direccion && newData.localidad && newData.provincia)) {
      const coords = await geocodeAddress(newData);
      if (coords) {
        latitud = coords.lat;
        longitud = coords.lon;
      }
    }

    const { nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id, observaciones, repositorio_fotografico } = newData;
    await conn.query(
      'UPDATE sedes SET nombre_sede = ?, direccion = ?, codigo_postal = ?, localidad = ?, provincia = ?, telefono = ?, territorio_id = ?, observaciones = ?, repositorio_fotografico = ?, latitud = ?, longitud = ? WHERE id = ?',
      [nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id || null, observaciones, repositorio_fotografico, latitud, longitud, id]
    );
    
    res.json({ message: 'Sede actualizada con éxito.' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar la sede.' });
  } finally {
    if (conn) conn.release();
  }
};

export const getTrabajadoresBySede = async (req, res) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT 
          t.*, 
          p.nombre_puesto as puesto,
          COALESCE(s.nombre_sede, c.nombre_centro) AS ubicacion,
          d.nombre as departamento,
          ter.codigo as territorio
        FROM trabajadores t
        LEFT JOIN puestos p ON t.puesto_id = p.id
        LEFT JOIN sedes s ON t.sede_id = s.id
        LEFT JOIN centros c ON t.centro_id = c.id
        LEFT JOIN departamentos d ON t.departamento_id = d.id
        LEFT JOIN territorios ter ON t.territorio_id = ter.id
        WHERE t.sede_id = ? AND t.estado = 'Alta'
        ORDER BY t.apellidos, t.nombre;
      `;
      const [trabajadores] = await pool.query(query, [id]);
      res.json(trabajadores);
    } catch (error) {
      console.error("Error al obtener los trabajadores de la sede:", error);
      res.status(500).json({ message: 'Error del servidor.' });
    }
};