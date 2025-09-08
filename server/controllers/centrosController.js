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
          cp.id, cp.categoria, cp.detalles, cp.proveedor_id, cp.aplicacion_id,
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
      res.status(500).json({ message: 'Error del servidor.', error: error.message });
    } finally {
      if (conn) conn.release();
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
      const puestoIdDirector = 12;
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

// --- CREATE ---
export const createCentro = async (req, res) => {
  const { nombre_centro, direccion, codigo_postal, localidad, provincia, territorio_id, tipo_centro_id, observaciones, repositorio_fotografico } = req.body;
  if (!nombre_centro) {
    return res.status(400).json({ message: 'El nombre del centro es requerido.' });
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
    const query = `
      INSERT INTO centros (nombre_centro, direccion, codigo_postal, localidad, provincia, territorio_id, tipo_centro_id, observaciones, repositorio_fotografico, latitud, longitud) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      nombre_centro, direccion, codigo_postal, localidad, provincia,
      territorio_id || null, tipo_centro_id || null, observaciones, repositorio_fotografico,
      latitud, longitud
    ]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Error al crear el centro:", error);
    res.status(500).json({ message: 'Error del servidor al crear el centro.' });
  }
};

// --- UPDATE ---
export const updateCentro = async (req, res) => {
  const { id } = req.params;
  const newData = req.body;
  if (!newData.nombre_centro) {
    return res.status(400).json({ message: 'El nombre del centro es requerido.' });
  }

  const conn = await pool.getConnection();
  try {
    const [currentRows] = await conn.query('SELECT direccion, localidad, provincia, codigo_postal, latitud, longitud FROM centros WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      return res.status(404).json({ message: 'Centro no encontrado.' });
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

    const { nombre_centro, direccion, codigo_postal, localidad, provincia, territorio_id, tipo_centro_id, observaciones, repositorio_fotografico } = newData;
    const query = `
      UPDATE centros SET 
        nombre_centro = ?, direccion = ?, codigo_postal = ?, localidad = ?, provincia = ?,
        territorio_id = ?, tipo_centro_id = ?, observaciones = ?, repositorio_fotografico = ?,
        latitud = ?, longitud = ?
      WHERE id = ?
    `;
    await conn.query(query, [
      nombre_centro, direccion, codigo_postal, localidad, provincia,
      territorio_id || null, tipo_centro_id || null, observaciones, repositorio_fotografico,
      latitud, longitud, id
    ]);
    
    res.json({ message: 'Centro actualizado con éxito.' });
  } catch (error) {
    console.error("Error al actualizar el centro:", error);
    res.status(500).json({ message: 'Error del servidor al actualizar el centro.' });
  } finally {
    if (conn) conn.release();
  }
};