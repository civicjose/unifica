import pool from '../config/database.js';
export const getAllPuestos = async (req, res) => {
  try {
    const [puestos] = await pool.query('SELECT id, nombre_puesto as nombre FROM puestos ORDER BY nombre_puesto');
    res.json(puestos);
  } catch (error) { res.status(500).json({ message: 'Error del servidor.' }); }
};