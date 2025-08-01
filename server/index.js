// server/index.js
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import trabajadoresRoutes from './routes/trabajadoresRoutes.js';
import puestosRoutes from './routes/puestosRoutes.js';
import sedesRoutes from './routes/sedesRoutes.js';
import centrosRoutes from './routes/centrosRoutes.js';
import territoriosRoutes from './routes/territoriosRoutes.js';
import departamentosRoutes from './routes/departamentosRoutes.js';
import tipoCentroRoutes from './routes/tipoCentroRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/puestos', puestosRoutes);
app.use('/api/sedes', sedesRoutes);
app.use('/api/centros', centrosRoutes);
app.use('/api/territorios', territoriosRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/tipos-centro', tipoCentroRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});