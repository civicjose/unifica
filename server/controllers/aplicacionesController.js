import pool from "../config/database.js";

// GET /api/aplicaciones?proveedorId=... - Obtener todas las aplicaciones
export const getAllAplicaciones = async (req, res) => {
  const { proveedorId } = req.query;
  try {
    let query = `
   SELECT 
    a.id, a.nombre_aplicacion, a.proveedor_id, p.nombre_proveedor,
    (SELECT JSON_ARRAYAGG(
      JSON_OBJECT('id', pc.id, 'nombre', pc.nombre, 'email', pc.email, 'telefono', pc.telefono, 'cargo', pc.cargo)
     )
    FROM aplicacion_contactos ac
    JOIN proveedor_contactos pc ON ac.contacto_id = pc.id
    WHERE ac.aplicacion_id = a.id
    ) as contactos_asignados
   FROM aplicaciones a
   LEFT JOIN proveedores p ON a.proveedor_id = p.id
  `;
    const params = [];
    if (proveedorId) {
      query += " WHERE a.proveedor_id = ?";
      params.push(proveedorId);
    }
    query += " GROUP BY a.id, p.nombre_proveedor";
    query += " ORDER BY a.nombre_aplicacion";

    const [aplicaciones] = await pool.query(query, params);

    const aplicacionesProcesadas = aplicaciones.map((app) => ({
      ...app,
      contactos_asignados: app.contactos_asignados
        ? JSON.parse(app.contactos_asignados)
        : [],
    }));

    res.json(aplicacionesProcesadas);
  } catch (error) {
    console.error("Error al obtener aplicaciones:", error);
    res
      .status(500)
      .json({
        message: "Error del servidor al obtener aplicaciones.",
        error: error.message,
      });
  }
};

// POST /api/aplicaciones - Crear una nueva aplicación
export const createAplicacion = async (req, res) => {
  const { nombre_aplicacion, proveedor_id } = req.body;
  if (!nombre_aplicacion) {
    return res
      .status(400)
      .json({ message: "El nombre de la aplicación es requerido." });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO aplicaciones (nombre_aplicacion, proveedor_id) VALUES (?, ?)",
      [nombre_aplicacion, proveedor_id || null]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor al crear la aplicación." });
  }
};

// PUT /api/aplicaciones/:id - Actualizar una aplicación
export const updateAplicacion = async (req, res) => {
  const { id } = req.params;
  const { nombre_aplicacion, proveedor_id } = req.body;
  if (!nombre_aplicacion) {
    return res
      .status(400)
      .json({ message: "El nombre de la aplicación es requerido." });
  }
  try {
    const [result] = await pool.query(
      "UPDATE aplicaciones SET nombre_aplicacion = ?, proveedor_id = ? WHERE id = ?",
      [nombre_aplicacion, proveedor_id || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Aplicación no encontrada." });
    }
    res.json({ id, ...req.body });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor al actualizar la aplicación." });
  }
};

// DELETE /api/aplicaciones/:id - Eliminar una aplicación
export const deleteAplicacion = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM aplicaciones WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Aplicación no encontrada." });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(400)
        .json({
          message:
            "No se puede eliminar. Esta aplicación está asignada a un servicio.",
        });
    }
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar la aplicación." });
  }
};

// GET /api/aplicaciones/:id/contactos - Obtener los OBJETOS de los contactos asignados a una app
export const getAplicacionContactos = async (req, res) => {
  const { id } = req.params;
  try {
    const [contactos] = await pool.query(
      `SELECT c.id, c.nombre, c.cargo 
             FROM proveedor_contactos c
             JOIN aplicacion_contactos ac ON c.id = ac.contacto_id
             WHERE ac.aplicacion_id = ?`,
      [id]
    );
    res.json(contactos);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los contactos de la aplicación." });
  }
};

// PUT /api/aplicaciones/:id/contactos - Asignar/actualizar los contactos de una app
export const setAplicacionContactos = async (req, res) => {
  const { id } = req.params;
  const { contactIds } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      "DELETE FROM aplicacion_contactos WHERE aplicacion_id = ?",
      [id]
    );

    if (contactIds && contactIds.length > 0) {
      const values = contactIds.map((contactId) => [id, contactId]);
      await conn.query(
        "INSERT INTO aplicacion_contactos (aplicacion_id, contacto_id) VALUES ?",
        [values]
      );
    }

    await conn.commit();
    res.json({ message: "Contactos de la aplicación actualizados con éxito." });
  } catch (error) {
    await conn.rollback();
    res
      .status(500)
      .json({ message: "Error al actualizar los contactos de la aplicación." });
  } finally {
    conn.release();
  }
};
