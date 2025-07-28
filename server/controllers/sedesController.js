import pool from '../config/database.js';
export const getAllSedes = async (req, res) => {
  try {
    const [sedes] = await pool.query('SELECT id, nombre_sede as nombre FROM sedes ORDER BY nombre_sede');
    res.json(sedes);
  } catch (error) { res.status(500).json({ message: 'Error del servidor.' }); }
};