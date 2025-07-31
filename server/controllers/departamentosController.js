import pool from '../config/database.js';
export const getAllDepartamentos = async (req, res) => {
  try {
    const [departamentos] = await pool.query('SELECT id, nombre FROM departamentos ORDER BY nombre');
    res.json(departamentos);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener departamentos.' });
  }
};