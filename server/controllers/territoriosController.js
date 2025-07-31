import pool from '../config/database.js';
export const getAllTerritorios = async (req, res) => {
  try {
    const [territorios] = await pool.query('SELECT id, codigo, zona FROM territorios ORDER BY codigo');
    res.json(territorios);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener territorios.' });
  }
};