import pool from '../config/database.js';
export const getAllCentros = async (req, res) => {
  try {
    const [centros] = await pool.query('SELECT id, nombre_centro as nombre FROM centros ORDER BY nombre_centro');
    res.json(centros);
  } catch (error) { res.status(500).json({ message: 'Error del servidor.' }); }
};