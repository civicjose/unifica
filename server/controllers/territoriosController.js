import pool from '../config/database.js';
import { remove } from './genericController.js';

// Función para obtener todos los territorios
export const getAllTerritorios = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT id, codigo, zona FROM territorios ORDER BY codigo');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener territorios.' });
  }
};

// Función CREATE específica para territorios
export const createTerritorio = async (req, res) => {
  const { codigo, zona } = req.body;
  if (!codigo || !zona) {
    return res.status(400).json({ message: 'Los campos código y zona son requeridos.' });
  }
  try {
    const [result] = await pool.query('INSERT INTO territorios (codigo, zona) VALUES (?, ?)', [codigo, zona]);
    res.status(201).json({ id: result.insertId, codigo, zona });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al crear el territorio.' });
  }
};

// Función UPDATE específica para territorios
export const updateTerritorio = async (req, res) => {
  const { id } = req.params;
  const { codigo, zona } = req.body;
  if (!codigo || !zona) {
    return res.status(400).json({ message: 'Los campos código y zona son requeridos.' });
  }
  try {
    const [result] = await pool.query('UPDATE territorios SET codigo = ?, zona = ? WHERE id = ?', [codigo, zona, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Territorio no encontrado.' });
    }
    res.json({ id, codigo, zona });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar el territorio.' });
  }
};

// Se reutiliza la función genérica para eliminar
export const deleteTerritorio = remove('territorios');