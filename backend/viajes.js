import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosKilometros,
  validarFiltrosViajes,
  validarId,
  validarViaje,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const SELECT_VIAJES =
  "SELECT vj.id, vj.vehiculo_id, vj.conductor_id, vj.fecha_salida, vj.fecha_llegada, " +
  "vj.origen, vj.destino, vj.kilometros, vj.observaciones, " +
  "v.patente, v.marca, v.modelo, " +
  "c.nombre AS conductor_nombre, c.apellido AS conductor_apellido " +
  "FROM viajes vj " +
  "JOIN vehiculos v ON v.id = vj.vehiculo_id " +
  "JOIN conductores c ON c.id = vj.conductor_id";

// Verifica que existan el vehículo y el conductor, y que la licencia
// estuviera vigente en la fecha de salida. Devuelve un mensaje o null.
async function validarReferencias(vehiculo_id, conductor_id, fecha_salida) {
  const [vehiculos] = await db.execute(
    "SELECT id FROM vehiculos WHERE id = ?",
    [vehiculo_id],
  );

  if (vehiculos.length === 0) {
    return "El vehículo indicado no existe";
  }

  const [conductores] = await db.execute(
    "SELECT fecha_vencimiento_licencia FROM conductores WHERE id = ?",
    [conductor_id],
  );

  if (conductores.length === 0) {
    return "El conductor indicado no existe";
  }

  const vencimiento = new Date(conductores[0].fecha_vencimiento_licencia);

  if (vencimiento < new Date(fecha_salida)) {
    return "La licencia del conductor estaba vencida en la fecha de salida";
  }

  return null;
}

// GET historial de viajes. Filtros: vehiculo_id, conductor_id, desde, hasta
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { vehiculo_id, conductor_id, desde, hasta } = req.query;

    if (vehiculo_id) {
      filtros.push("vj.vehiculo_id = ?");
      parametros.push(Number(vehiculo_id));
    }

    if (conductor_id) {
      filtros.push("vj.conductor_id = ?");
      parametros.push(Number(conductor_id));
    }

    if (desde) {
      filtros.push("vj.fecha_salida >= ?");
      parametros.push(desde);
    }

    if (hasta) {
      filtros.push("vj.fecha_salida <= ?");
      parametros.push(hasta);
    }

    let sql = SELECT_VIAJES;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY vj.fecha_salida DESC";

    const [viajes] = await db.execute(sql, parametros);

    res.json(viajes);
  },
);

// GET total de kilómetros por vehículo o por conductor.
// IMPORTANTE: va antes de "/:id" para que "kilometros" no se tome como id.
router.get(
  "/kilometros",
  validarAutenticacion,
  validarFiltrosKilometros,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { vehiculo_id, conductor_id } = req.query;

    if (vehiculo_id) {
      filtros.push("vehiculo_id = ?");
      parametros.push(Number(vehiculo_id));
    }

    if (conductor_id) {
      filtros.push("conductor_id = ?");
      parametros.push(Number(conductor_id));
    }

    const sql =
      "SELECT COALESCE(SUM(kilometros), 0) AS total_kilometros, COUNT(*) AS cantidad_viajes " +
      "FROM viajes WHERE " +
      filtros.join(" AND ");

    const [filas] = await db.execute(sql, parametros);

    res.json({
      total_kilometros: Number(filas[0].total_kilometros),
      cantidad_viajes: filas[0].cantidad_viajes,
    });
  },
);

// GET detalle de viaje
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [viajes] = await db.execute(SELECT_VIAJES + " WHERE vj.id = ?", [id]);

    if (viajes.length === 0) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    res.json(viajes[0]);
  },
);

// POST para registrar un viaje
router.post(
  "/",
  validarAutenticacion,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const {
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = req.body;

    const error = await validarReferencias(
      vehiculo_id,
      conductor_id,
      fecha_salida,
    );

    if (error) {
      return res.status(400).json({ error });
    }

    const [result] = await db.execute(
      "INSERT INTO viajes " +
        "(vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        kilometros,
        observaciones ?? null,
      ],
    );

    res.status(201).json({
      id: result.insertId,
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones: observaciones ?? null,
    });
  },
);

// PUT para modificar un viaje
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const {
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = req.body;

    const error = await validarReferencias(
      vehiculo_id,
      conductor_id,
      fecha_salida,
    );

    if (error) {
      return res.status(400).json({ error });
    }

    const [result] = await db.execute(
      "UPDATE viajes SET vehiculo_id = ?, conductor_id = ?, fecha_salida = ?, fecha_llegada = ?, " +
        "origen = ?, destino = ?, kilometros = ?, observaciones = ? WHERE id = ?",
      [
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        kilometros,
        observaciones ?? null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    res.json({
      id,
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones: observaciones ?? null,
    });
  },
);

// DELETE para eliminar un viaje
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM viajes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    res.json({ mensaje: "Viaje eliminado correctamente" });
  },
);

export default router;