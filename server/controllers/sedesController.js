import pool from '../config/database.js';
import axios from 'axios';

// --- FUNCIÓN MEJORADA PARA "LIMPIAR" LA DIRECCIÓN ---
const cleanAddressForGeocoding = (address) => {
  // 1. Elimina palabras clave comunes de piso/puerta y lo que les sigue.
  let cleaned = address.replace(/\s(piso|planta|puerta|local|escalera|bajo|esc|pta|pl)\.?\s?([\w-]+)?/gi, '');
  
  // 2. Elimina patrones como ", 5B", ", 1A", ", 4" que suelen ir después del número.
  cleaned = cleaned.replace(/,\s*\d+[a-zA-Z]?\b/g, '');
  
  // 3. Como último recurso, si aún hay varias comas, nos quedamos con las dos primeras partes.
  const parts = cleaned.split(',');
  if (parts.length > 2) {
      cleaned = `${parts[0]}, ${parts[1]}`;
  }

  return cleaned.trim();
};

const geocodeAddress = (address) => {
  const cleanedAddress = cleanAddressForGeocoding(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanedAddress)}&format=jsonv2&limit=1`;
  
  console.log(`[GEOCODING] Consultando URL con axios: ${url}`);

  return axios.get(url, {
    headers: { 'User-Agent': 'UnificaApp/1.0 (Contacto: jose.civico@macrosad.com)' },
    timeout: 7000
  })
  .then(response => {
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coords = { lat: parseFloat(result.lat), lon: parseFloat(result.lon) };
      console.log(`[GEOCODING] ÉXITO para "${cleanedAddress}":`, coords);
      return coords;
    } else {
      console.log(`[GEOCODING] FALLO para "${cleanedAddress}": Nominatim no devolvió resultados.`);
      return null;
    }
  })
  .catch(error => {
    console.error(`[GEOCODING] ERROR en la petición para "${cleanedAddress}":`, error.message);
    return null;
  });
};


// --- GETTERS y DELETE ---
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

// --- CREATE ---
export const createSede = async (req, res) => {
  const { nombre_sede, direccion, codigo_postal, localidad, provincia, telefono, territorio_id, observaciones, repositorio_fotografico } = req.body;
  if (!nombre_sede) {
    return res.status(400).json({ message: 'El nombre de la sede es requerido.' });
  }
  let latitud = null;
  let longitud = null;
  if (direccion && localidad && provincia) {
    const fullAddress = `${direccion}, ${codigo_postal} ${localidad}, ${provincia}, España`;
    const coords = await geocodeAddress(fullAddress);
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

// --- UPDATE ---
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
      const fullAddress = `${newData.direccion}, ${newData.codigo_postal} ${newData.localidad}, ${newData.provincia}, España`;
      const coords = await geocodeAddress(fullAddress);
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