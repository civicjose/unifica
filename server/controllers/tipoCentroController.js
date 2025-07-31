import pool from '../config/database.js';
export const getAllTiposCentro = async (req, res) => {
  try {
    const [tipos] = await pool.query('SELECT id, abreviatura, nombre_completo FROM tipo_centro ORDER BY abreviatura');
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener tipos de centro.' });
  }
};