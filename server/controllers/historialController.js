import pool from '../config/database.js';

// --- Función Auxiliar para obtener todos los datos de referencia ---
const getReferenceData = async (conn) => {
  const [sedes] = await conn.query('SELECT id, nombre_sede as nombre FROM sedes');
  const [centros] = await conn.query('SELECT id, nombre_centro as nombre FROM centros');
  const [puestos] = await conn.query('SELECT id, nombre_puesto as nombre FROM puestos');
  const [departamentos] = await conn.query('SELECT id, nombre FROM departamentos');
  const [territorios] = await conn.query('SELECT id, codigo as nombre FROM territorios');

  // Creamos mapas para una búsqueda ultra-rápida (ID -> Nombre)
  return {
    sedesMap: new Map(sedes.map(item => [item.id, item.nombre])),
    centrosMap: new Map(centros.map(item => [item.id, item.nombre])),
    puestosMap: new Map(puestos.map(item => [item.id, item.nombre])),
    departamentosMap: new Map(departamentos.map(item => [item.id, item.nombre])),
    territoriosMap: new Map(territorios.map(item => [item.id, item.nombre])),
  };
};

const getHistorialPorEntidad = async (req, res) => {
  const { entidad, id } = req.params;

  try {
    const conn = await pool.getConnection();
    
    // 1. Obtenemos los mapas de referencia (Sedes, Puestos, etc.)
    const referenceMaps = await getReferenceData(conn);

    const query = `
      SELECT 
        h.id, h.fecha_modificacion, u.nombre_completo as usuario_modificador,
        h.campo_modificado, h.valor_anterior, h.valor_nuevo
      FROM historial_modificaciones h
      LEFT JOIN usuarios_app u ON h.usuario_modificador_id = u.id
      WHERE h.entidad_modificada = ? AND h.id_entidad_modificada = ?
      ORDER BY h.fecha_modificacion DESC;
    `;
    
    const [historial] = await conn.query(query, [entidad, id]);
    conn.release();

    // 2. Procesamos cada registro del historial para "traducir" los valores
    const historialProcesado = historial
      .map(item => {
        let valorAnterior = item.valor_anterior;
        let valorNuevo = item.valor_nuevo;

        // Usamos un switch para traducir los IDs a Nombres
        switch (item.campo_modificado) {
          case 'sede_id':
            valorAnterior = referenceMaps.sedesMap.get(parseInt(valorAnterior)) || valorAnterior;
            valorNuevo = referenceMaps.sedesMap.get(parseInt(valorNuevo)) || valorNuevo;
            break;
          case 'centro_id':
            valorAnterior = referenceMaps.centrosMap.get(parseInt(valorAnterior)) || valorAnterior;
            valorNuevo = referenceMaps.centrosMap.get(parseInt(valorNuevo)) || valorNuevo;
            break;
          case 'puesto_id':
            valorAnterior = referenceMaps.puestosMap.get(parseInt(valorAnterior)) || valorAnterior;
            valorNuevo = referenceMaps.puestosMap.get(parseInt(valorNuevo)) || valorNuevo;
            break;
          case 'departamento_id':
            valorAnterior = referenceMaps.departamentosMap.get(parseInt(valorAnterior)) || valorAnterior;
            valorNuevo = referenceMaps.departamentosMap.get(parseInt(valorNuevo)) || valorNuevo;
            break;
          case 'territorio_id':
            valorAnterior = referenceMaps.territoriosMap.get(parseInt(valorAnterior)) || valorAnterior;
            valorNuevo = referenceMaps.territoriosMap.get(parseInt(valorNuevo)) || valorNuevo;
            break;
        }

        return {
          ...item,
          valor_anterior: valorAnterior,
          valor_nuevo: valorNuevo,
        };
      })
      // 3. Filtramos las filas que no aportan información (ej: sede_id que nunca tuvo valor)
      .filter(item => !(item.valor_anterior === null && item.valor_nuevo === null));

    res.json(historialProcesado);

  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el historial.' });
  }
};

export { getHistorialPorEntidad };