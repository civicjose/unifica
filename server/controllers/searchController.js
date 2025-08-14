import pool from '../config/database.js';

// GET /api/search/global?term=...
export const globalSearch = async (req, res) => {
  const { term } = req.query;

  if (!term || term.length < 3) {
    // No buscamos si el término es muy corto para evitar sobrecargar la BD
    return res.json({ trabajadores: [], centros: [], sedes: [] });
  }

  const searchTerm = `%${term}%`;
  const conn = await pool.getConnection();

  try {
    const [trabajadores, centros, sedes] = await Promise.all([
      conn.query(
        `SELECT id, nombre, apellidos FROM trabajadores WHERE (nombre LIKE ? OR apellidos LIKE ?) AND estado = 'Alta' LIMIT 5`,
        [searchTerm, searchTerm]
      ),
      conn.query(
        `SELECT id, nombre_centro FROM centros WHERE nombre_centro LIKE ? LIMIT 5`,
        [searchTerm]
      ),
      conn.query(
        `SELECT id, nombre_sede FROM sedes WHERE nombre_sede LIKE ? LIMIT 5`,
        [searchTerm]
      ),
    ]);
    
    res.json({
      trabajadores: trabajadores[0],
      centros: centros[0],
      sedes: sedes[0]
    });

  } catch (error) {
    console.error("Error en la búsqueda global:", error);
    res.status(500).json({ message: 'Error del servidor al realizar la búsqueda.' });
  } finally {
    if (conn) conn.release();
  }
};