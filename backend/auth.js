import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import {
  validarLogin,
  validarRegistro,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// POST para registrar un usuario
router.post(
  "/register",
  validarRegistro,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, email, password } = req.body;

    const [existentes] = await db.execute(
      "SELECT id FROM usuario WHERE email = ?",
      [email],
    );

    if (existentes.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // La contraseña se guarda siempre encriptada
    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO usuario (nombre, email, `contraseña`) VALUES (?, ?, ?)",
      [nombre, email, hash],
    );

    res.status(201).json({ id: result.insertId, nombre, email });
  },
);

// POST para iniciar sesión y obtener el token
router.post(
  "/login",
  validarLogin,
  verificarValidaciones,
  async (req, res) => {
    const { email, password } = req.body;

    const [usuarios] = await db.execute(
      "SELECT id, nombre, email, `contraseña` AS password FROM usuario WHERE email = ?",
      [email],
    );

    // Mismo mensaje para usuario inexistente y contraseña incorrecta
    if (usuarios.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = usuarios[0];
    const coincide = await bcrypt.compare(password, usuario.password);

    if (!coincide) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  },
);

export default router;