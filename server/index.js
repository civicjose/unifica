// server/index.js de PRUEBA
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Creamos una ruta de login falsa que siempre funciona
app.post('/api/auth/login', (req, res) => {
  console.log("¡La petición de login LLEGÓ al servidor de prueba!");
  res.json({ message: 'Login de prueba exitoso', token: 'token_de_prueba_123' });
});

// Una ruta de prueba para ver si la API responde
app.get('/api', (req, res) => {
  res.json({ message: '¡La API de PRUEBA está funcionando!' });
});

export default app;