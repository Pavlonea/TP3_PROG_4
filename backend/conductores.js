import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarConductor,
  validarFiltrosConductores,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const COLUMNAS =
  "c.id, c.nombre, c.apellido, c.numero_documento, c.numero_licencia, " +
  "c.fecha_alta_licencia, c.fecha_vencimiento_licencia";

// GET para entregar listado de conductores
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosConductores,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { nombre, apellido, numero_documento } = req.query;

    if (nombre) {
      filtros.push("c.nombre LIKE ?");
      parametros.push(`%${nombre}%`);
    }

    if (apellido) {
      filtros.push("c.apellido LIKE ?");
      parametros.push(`%${apellido}%`);
    }

    if (numero_documento) {
      filtros.push("c.numero_documento LIKE ?");
      parametros.push(`%${numero_documento}%`);
    }

    let sql = `SELECT ${COLUMNAS} FROM conductores c`;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY c.apellido, c.nombre";

    const [conductores] = await db.execute(sql, parametros);

    res.json(conductores);
  },
);

// GET para entregar detalle de conductor
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [conductores] = await db.execute(
      `SELECT ${COLUMNAS} FROM conductores c WHERE c.id = ?`,
      [id],
    );

    if (conductores.length === 0) {
      return res.status(404).json({ error: "Conductor no encontrado" });
    }

    res.json(conductores[0]);
  },
);

// POST para crear conductor
router.post(
  "/",
  validarAutenticacion,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const {
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
    } = req.body;

    const [result] = await db.execute(
      "INSERT INTO conductores " +
        "(nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) " +
        "VALUES (?, ?, ?, ?, ?, ?)",
      [
        nombre,
        apellido,
        numero_documento,
        numero_licencia,
        fecha_alta_licencia,
        fecha_vencimiento_licencia,
      ],
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
    });
  },
);

// PUT para modificar conductor
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const {
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
    } = req.body;

    const [result] = await db.execute(
      "UPDATE conductores SET nombre = ?, apellido = ?, numero_documento = ?, " +
        "numero_licencia = ?, fecha_alta_licencia = ?, fecha_vencimiento_licencia = ? " +
        "WHERE id = ?",
      [
        nombre,
        apellido,
        numero_documento,
        numero_licencia,
        fecha_alta_licencia,
        fecha_vencimiento_licencia,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Conductor no encontrado" });
    }

    res.json({
      id,
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
    });
  },
);

// DELETE para eliminar conductor
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM conductores WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Conductor no encontrado" });
    }

    res.json({ mensaje: "Conductor eliminado correctamente" });
  },
);

export default router;