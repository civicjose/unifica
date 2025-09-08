import pool from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [
      [[trabajadoresRes]],
      [[sedesRes]],
      [[centrosRes]],
      [[proveedoresRes]],
      trabajadoresPorPuesto,
      centrosPorProvincia,
      actividadReciente,
      locationsForMap 
    ] = await Promise.all([
      // Queries de Conteos
      conn.query("SELECT COUNT(*) as count FROM trabajadores WHERE estado = 'Alta'"),
      conn.query("SELECT COUNT(*) as count FROM sedes"),
      conn.query("SELECT COUNT(*) as count FROM centros"),
      conn.query("SELECT COUNT(*) as count FROM proveedores"),
      
      // Query para Gráfico de Trabajadores
      conn.query(`
        SELECT p.nombre_puesto as name, COUNT(t.id) as value 
        FROM trabajadores t JOIN puestos p ON t.puesto_id = p.id 
        WHERE t.estado = 'Alta' GROUP BY p.nombre_puesto ORDER BY value DESC LIMIT 5;
      `).then(([rows]) => rows),
      
      // Query para Gráfico de Centros
      conn.query(`
        SELECT provincia as name, COUNT(id) as value 
        FROM centros WHERE provincia IS NOT NULL AND provincia != ''
        GROUP BY provincia ORDER BY value DESC LIMIT 5;
      `).then(([rows]) => rows),

      // Query para Feed de Actividad
      conn.query(`
        SELECT MAX(h.id) as id, MAX(h.fecha_modificacion) AS fecha_modificacion, u.nombre_completo AS usuario,
               h.tipo_accion, h.entidad_modificada,
               COALESCE(t.nombre, c.nombre_centro, s.nombre_sede, prov.nombre_proveedor) AS entidad_nombre
        FROM historial_modificaciones h
        JOIN usuarios_app u ON h.usuario_modificador_id = u.id
        LEFT JOIN trabajadores t ON h.id_entidad_modificada = t.id AND h.entidad_modificada = 'trabajadores'
        LEFT JOIN centros c ON h.id_entidad_modificada = c.id AND h.entidad_modificada = 'centros'
        LEFT JOIN sedes s ON h.id_entidad_modificada = s.id AND h.entidad_modificada = 'sedes'
        LEFT JOIN proveedores prov ON h.id_entidad_modificada = prov.id AND h.entidad_modificada = 'proveedores'
        WHERE COALESCE(t.nombre, c.nombre_centro, s.nombre_sede, prov.nombre_proveedor) IS NOT NULL
        GROUP BY u.nombre_completo, h.tipo_accion, h.entidad_modificada, h.id_entidad_modificada, entidad_nombre
        ORDER BY fecha_modificacion DESC LIMIT 7;
      `).then(([rows]) => rows),

      // Query para el Mapa (lee coordenadas directamente de la BD)
      conn.query(`
        (SELECT id, nombre_sede as nombre, 'Sede' as tipo, latitud as lat, longitud as lon FROM sedes WHERE latitud IS NOT NULL AND longitud IS NOT NULL)
        UNION ALL
        (SELECT id, nombre_centro as nombre, 'Centro' as tipo, latitud as lat, longitud as lon FROM centros WHERE latitud IS NOT NULL AND longitud IS NOT NULL)
      `).then(([rows]) => rows)
    ]);

    res.json({
      trabajadoresActivos: trabajadoresRes.count,
      totalSedes: sedesRes.count,
      totalCentros: centrosRes.count,
      totalProveedores: proveedoresRes.count,
      graficos: { trabajadoresPorPuesto, centrosPorProvincia },
      actividadReciente,
      locationsForMap,
    });

  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({ message: 'Error del servidor.', error: error.message });
  } finally {
    if (conn) conn.release();
  }
};