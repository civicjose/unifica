import pool from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [
      [trabajadoresRes], [sedesRes], [centrosRes], [proveedoresRes],
      [alertas],
      [completitudSedes], [completitudCentros], [completitudTrabajadores]
    ] = await Promise.all([
      // --- Conteos ---
      conn.query("SELECT COUNT(*) as count FROM trabajadores WHERE estado = 'Alta'"),
      conn.query("SELECT COUNT(*) as count FROM sedes"),
      conn.query("SELECT COUNT(*) as count FROM centros"),
      conn.query("SELECT COUNT(*) as count FROM proveedores"),

      // --- Alertas Específicas (Consulta Corregida) ---
      conn.query(`
        (SELECT 
            id, 
            nombre_sede as nombre, 
            'Sede' as tipo, 
            -- CORRECCIÓN: Usamos CONCAT_WS que ignora los valores nulos
            CONCAT_WS(', ',
                CASE WHEN telefono IS NULL OR telefono = '' THEN 'Teléfono' END,
                CASE WHEN repositorio_fotografico IS NULL OR repositorio_fotografico = '' THEN 'Repositorio' END
            ) as faltante
        FROM sedes
        WHERE telefono IS NULL OR telefono = '' OR repositorio_fotografico IS NULL OR repositorio_fotografico = ''
        LIMIT 3)
        UNION ALL
        (SELECT id, nombre_centro as nombre, 'Centro' as tipo, 'Repositorio' as faltante
        FROM centros
        WHERE repositorio_fotografico IS NULL OR repositorio_fotografico = ''
        LIMIT 3)
        UNION ALL
        (SELECT id, CONCAT(nombre, ' ', apellidos) as nombre, 'Trabajador' as tipo, 'Puesto' as faltante
        FROM trabajadores
        WHERE puesto_id IS NULL AND estado = 'Alta'
        LIMIT 3);
      `),

      // --- Resumen de Completitud ---
      conn.query("SELECT COUNT(*) as total, COUNT(telefono) as con_telefono, COUNT(repositorio_fotografico) as con_repo FROM sedes"),
      conn.query("SELECT COUNT(*) as total, COUNT(repositorio_fotografico) as con_repo FROM centros"),
      conn.query("SELECT COUNT(*) as total, COUNT(puesto_id) as con_puesto FROM trabajadores WHERE estado = 'Alta'"),
    ]);

    res.json({
      trabajadoresActivos: trabajadoresRes[0].count,
      totalSedes: sedesRes[0].count,
      totalCentros: centrosRes[0].count,
      totalProveedores: proveedoresRes[0].count,
      alertas: alertas,
      completitud: {
        sedes: { ...completitudSedes[0] },
        centros: { ...completitudCentros[0] },
        trabajadores: { ...completitudTrabajadores[0] },
      }
    });

  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({ message: 'Error del servidor.', error: error.message });
  } finally {
    if (conn) conn.release();
  }
};