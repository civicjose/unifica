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
import glpiRoutes from './routes/glpiRoutes.js';
import historialRoutes from './routes/historialRoutes.js';
import proveedoresRoutes from './routes/proveedoresRoutes.js';
import aplicacionesRoutes from './routes/aplicacionesRoutes.js';
import centroProveedorRoutes from './routes/centroProveedorRoutes.js';
import sedeProveedorRoutes from './routes/sedeProveedorRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import categoriasProveedorRoutes from './routes/categoriasProveedorRoutes.js';
import gastosRoutes from './routes/gastosRoutes.js';

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
app.use('/api/glpi', glpiRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/aplicaciones', aplicacionesRoutes);
app.use('/api/centro-proveedor', centroProveedorRoutes);
app.use('/api/sede-proveedor', sedeProveedorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/categorias-proveedor', categoriasProveedorRoutes);
app.use('/api/gastos', gastosRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});