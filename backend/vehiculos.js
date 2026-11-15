import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosVehiculos,
  validarId,
  validarVehiculo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// La columna en la base se llama `año`; se entrega al frontend como "anio"
const COLUMNAS =
  "v.id, v.marca, v.modelo, v.patente, v.`año` AS anio, v.capacidad_carga";

// GET para entregar listado de vehículos
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosVehiculos,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { marca, modelo, patente, anioMin, anioMax } = req.query;

    if (marca) {
      filtros.push("v.marca LIKE ?");
      parametros.push(`%${marca}%`);
    }

    if (modelo) {
      filtros.push("v.modelo LIKE ?");
      parametros.push(`%${modelo}%`);
    }

    if (patente) {
      filtros.push("v.patente LIKE ?");
      parametros.push(`%${patente}%`);
    }

    if (anioMin !== undefined) {
      filtros.push("v.`año` >= ?");
      parametros.push(Number(anioMin));
    }

    if (anioMax !== undefined) {
      filtros.push("v.`año` <= ?");
      parametros.push(Number(anioMax));
    }

    let sql = `SELECT ${COLUMNAS} FROM vehiculos v`;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    // TODO: Agregar consulta de paginacion (offset, limit)
    // TODO: Agregar consulta para ordenar (ascendente o descendente)

    const [vehiculos] = await db.execute(sql, parametros);

    res.json(vehiculos);
  },
);

// GET para entregar detalle de vehículo
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [vehiculos] = await db.execute(
      `SELECT ${COLUMNAS} FROM vehiculos v WHERE v.id = ?`,
      [id],
    );

    if (vehiculos.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(vehiculos[0]);
  },
);

// POST para crear vehículo
router.post(
  "/",
  validarAutenticacion,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;

    const [result] = await db.execute(
      "INSERT INTO vehiculos (marca, modelo, patente, `año`, capacidad_carga) VALUES (?, ?, ?, ?, ?)",
      [marca, modelo, patente, anio, capacidad_carga],
    );

    res.status(201).json({
      id: result.insertId,
      marca,
      modelo,
      patente,
      anio,
      capacidad_carga,
    });
  },
);

// PUT para modificar vehículo
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const { marca, modelo, patente, anio, capacidad_carga } = req.body;

    const [result] = await db.execute(
      "UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, `año` = ?, capacidad_carga = ? WHERE id = ?",
      [marca, modelo, patente, anio, capacidad_carga, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ id, marca, modelo, patente, anio, capacidad_carga });
  },
);

// DELETE para eliminar vehículo
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM vehiculos WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ mensaje: "Vehículo eliminado correctamente" });
  },
);

export default router;