import pool from '../config/database.js';

// Función para obtener todos los items de una tabla
export const getAll = (tableName, nameField, orderByField) => async (req, res) => {
  try {
    const query = `SELECT id, ${nameField} as nombre FROM ${tableName} ORDER BY ${orderByField}`;
    const [items] = await pool.query(query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: `Error del servidor al obtener de ${tableName}.` });
  }
};

// Función para crear un nuevo item
export const create = (tableName, nameField) => async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: 'El campo nombre es requerido.' });
  }
  try {
    const [result] = await pool.query(`INSERT INTO ${tableName} (${nameField}) VALUES (?)`, [nombre]);
    res.status(201).json({ id: result.insertId, nombre });
  } catch (error) {
    res.status(500).json({ message: `Error del servidor al crear en ${tableName}.` });
  }
};

// Función para actualizar un item existente
export const update = (tableName, nameField) => async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: 'El campo nombre es requerido.' });
  }
  try {
    const [result] = await pool.query(`UPDATE ${tableName} SET ${nameField} = ? WHERE id = ?`, [nombre, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Elemento no encontrado.' });
    }
    res.json({ id, nombre });
  } catch (error) {
    res.status(500).json({ message: `Error del servidor al actualizar en ${tableName}.` });
  }
};

// Función para eliminar un item
export const remove = (tableName) => async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Elemento no encontrado.' });
    }
    res.status(204).send(); // 204 No Content: éxito sin devolver nada
  } catch (error) {
    // Manejar error de clave foránea (si se intenta borrar algo que está en uso)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar porque está en uso por otros registros.' });
    }
    res.status(500).json({ message: `Error del servidor al eliminar de ${tableName}.` });
  }
};