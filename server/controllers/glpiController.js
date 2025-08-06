import glpiPool from '../config/glpiDatabase.js';

const getComputerByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'El email es requerido.' });
  }

  try {
    const query = `
      SELECT pc.name
      FROM glpi_computers pc
      JOIN glpi_users u ON pc.users_id = u.id
      WHERE u.name = ?
      LIMIT 1;
    `;

    const [rows] = await glpiPool.query(query, [email]);

    if (rows.length > 0) {
      res.json({ computerName: rows[0].name });
    } else {
      res.status(404).json({ message: 'No se encontró un equipo asignado a este usuario.' });
    }
  } catch (error) {
    console.error('Error al consultar GLPI:', error);
    res.status(500).json({ message: 'Error del servidor al consultar GLPI.' });
  }
};

export { getComputerByEmail };