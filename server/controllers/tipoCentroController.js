import pool from '../config/database.js';
import { remove } from './genericController.js';

// GET - Devuelve todos los campos necesarios
export const getAllTiposCentro = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT id, abreviatura, nombre_completo FROM tipo_centro ORDER BY abreviatura');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener tipos de centro.' });
  }
};

// CREATE - Crea un nuevo tipo de centro con ambos campos
export const createTipoCentro = async (req, res) => {
  const { abreviatura, nombre_completo } = req.body;
  if (!abreviatura || !nombre_completo) {
    return res.status(400).json({ message: 'Ambos campos, abreviatura y nombre completo, son requeridos.' });
  }
  try {
    const [result] = await pool.query('INSERT INTO tipo_centro (abreviatura, nombre_completo) VALUES (?, ?)', [abreviatura, nombre_completo]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al crear el tipo de centro.' });
  }
};

// UPDATE - Actualiza un tipo de centro con ambos campos
export const updateTipoCentro = async (req, res) => {
  const { id } = req.params;
  const { abreviatura, nombre_completo } = req.body;
  if (!abreviatura || !nombre_completo) {
    return res.status(400).json({ message: 'Ambos campos, abreviatura y nombre completo, son requeridos.' });
  }
  try {
    const [result] = await pool.query('UPDATE tipo_centro SET abreviatura = ?, nombre_completo = ? WHERE id = ?', [abreviatura, nombre_completo, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tipo de centro no encontrado.' });
    }
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar el tipo de centro.' });
  }
};

// DELETE - Reutilizamos la función genérica
export const deleteTipoCentro = remove('tipo_centro');