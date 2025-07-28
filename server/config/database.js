// server/config/database.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('Conectado a la base de datos MariaDB.');
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });

// 👇 La corrección final de todo el backend
export default pool;