import express from "express";
import cors from "cors";
import passport from "passport";
import authRouter from "./auth.js";
import vehiculosRouter from "./vehiculos.js";
import conductoresRouter from "./conductores.js";
import viajesRouter from "./viajes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Rutas
app.use("/auth", authRouter);
app.use("/vehiculos", vehiculosRouter);
app.use("/conductores", conductoresRouter);
app.use("/viajes", viajesRouter);

// Ruta inexistente (404)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware de errores: siempre después de las rutas
app.use((err, req, res, next) => {
  // JSON mal formado en el body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El JSON enviado no es válido" });
  }

  console.error(err);

  if (err.code === "ER_DUP_ENTRY") {
    return res
      .status(409)
      .json({ error: "Ya existe un registro con esos datos" });
  }

  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    return res
      .status(409)
      .json({ error: "No se puede eliminar: tiene registros asociados" });
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ error: "Referencia inválida" });
  }

  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
