// server/controllers/authController.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const registerUser = async (req, res) => {
  const { nombre_completo, email, password, rol_id } = req.body;
  if (!nombre_completo || !email || !password || !rol_id) {
    return res.status(400).json({ message: 'Por favor, complete todos los campos.' });
  }
  try {
    const [userExists] = await pool.query('SELECT email FROM usuarios_app WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [newUser] = await pool.query(
      'INSERT INTO usuarios_app (nombre_completo, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre_completo, email, hashedPassword, rol_id]
    );
    if (newUser.affectedRows > 0) {
      res.status(201).json({ message: 'Usuario registrado con éxito', userId: newUser.insertId });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query(
      `SELECT u.*, r.nombre as rol_nombre 
       FROM usuarios_app u 
       JOIN roles r ON u.rol_id = r.id 
       WHERE u.email = ?`,
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (user && isMatch) {
      res.json({ message: 'Login exitoso', token: generateToken(user.id, user.rol_nombre) });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const generateToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });
};

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.nombre_completo, u.email, r.nombre as rol 
       FROM usuarios_app u 
       JOIN roles r ON u.rol_id = r.id 
       ORDER BY u.nombre_completo`
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id; // Obtenemos el ID de la URL

  // Evitar que un usuario se borre a sí mismo
  if (req.user.id == userId) {
    return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' });
  }

  try {
    const [result] = await pool.query('DELETE FROM usuarios_app WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { nombre_completo, email, rol_id } = req.body;

  if (!nombre_completo || !email || !rol_id) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE usuarios_app SET nombre_completo = ?, email = ?, rol_id = ? WHERE id = ?',
      [nombre_completo, email, rol_id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Usuario actualizado con éxito.' });
  } catch (error) {
    // Manejar el caso de email duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso por otro usuario.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

export {
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
  updateUser,
};