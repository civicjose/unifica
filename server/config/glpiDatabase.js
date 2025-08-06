// server/config/glpiDatabase.js
import mysql from 'mysql2/promise';

const glpiPool = mysql.createPool({
  host: process.env.GLPI_DB_HOST || 'localhost',
  user: process.env.GLPI_DB_USER || 'root',
  password: process.env.GLPI_DB_PASSWORD || '',
  database: process.env.GLPI_DB_DATABASE || 'glpi',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

glpiPool.getConnection()
  .then(connection => {
    console.log('Conectado a la base de datos de GLPI.');
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos de GLPI:', err.message);
  });

export default glpiPool;