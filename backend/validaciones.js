import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";


/* Passport: estrategia JWT  */

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const [usuarios] = await db.execute(
          "SELECT id, nombre, email FROM usuario WHERE id = ?",
          [payload.id],
        );

        if (usuarios.length === 0) {
          return done(null, false);
        }

        done(null, usuarios[0]);
      } catch (err) {
        done(err, false);
      }
    },
  ),
);

// Middleware que protege las rutas: responde 401 en JSON si el token falta,
// es inválido o expiró.
export const validarAutenticacion = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, usuario, info) => {
    if (err) {
      return next(err);
    }

    if (!usuario) {
      const mensaje =
        info?.name === "TokenExpiredError"
          ? "El token expiró, iniciá sesión nuevamente"
          : "No autorizado";
      return res.status(401).json({ error: mensaje });
    }

    req.user = usuario;
    next();
  })(req, res, next);
};


/* Middleware que devuelve los errores de express-validator */

export const verificarValidaciones = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  next();
};


/* Generales*/

export const validarId = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un entero positivo"),
];


/* Usuarios (auth)*/

export const validarRegistro = [
  body("nombre")
    .trim()
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ max: 100 }).withMessage("El nombre es demasiado largo"),
  body("email")
    .trim()
    .isEmail().withMessage("El email no tiene un formato válido")
    .normalizeEmail(),
  body("password")
    .isString().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6, max: 72 })
    .withMessage("La contraseña debe tener entre 6 y 72 caracteres"),
];

export const validarLogin = [
  body("email")
    .trim()
    .isEmail().withMessage("El email no tiene un formato válido")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];


/* Vehículos */

const anioMaximo = new Date().getFullYear() + 1;

export const validarVehiculo = [
  body("marca")
    .trim()
    .notEmpty().withMessage("La marca es obligatoria")
    .isLength({ max: 50 }).withMessage("La marca es demasiado larga"),
  body("modelo")
    .trim()
    .notEmpty().withMessage("El modelo es obligatorio")
    .isLength({ max: 50 }).withMessage("El modelo es demasiado largo"),
  body("patente")
    .trim()
    .toUpperCase()
    .matches(/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/)
    .withMessage("La patente debe tener formato ABC123 o AB123CD"),
  body("anio")
    .isInt({ min: 1900, max: anioMaximo })
    .withMessage(`El año debe estar entre 1900 y ${anioMaximo}`),
  body("capacidad_carga")
    .isFloat({ gt: 0 })
    .withMessage("La capacidad de carga debe ser un número mayor a 0"),
];

export const validarFiltrosVehiculos = [
  query("marca").optional().trim().isLength({ max: 50 }),
  query("modelo").optional().trim().isLength({ max: 50 }),
  query("patente").optional().trim().isLength({ max: 10 }),
  query("anioMin").optional().isInt({ min: 1900 }).withMessage("anioMin inválido"),
  query("anioMax").optional().isInt({ min: 1900 }).withMessage("anioMax inválido"),
];


/* Conductores*/

export const validarConductor = [
  body("nombre")
    .trim()
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ max: 45 }).withMessage("El nombre es demasiado largo"),
  body("apellido")
    .trim()
    .notEmpty().withMessage("El apellido es obligatorio")
    .isLength({ max: 45 }).withMessage("El apellido es demasiado largo"),
  body("numero_documento")
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage("El documento debe tener 7 u 8 dígitos"),
  body("numero_licencia")
    .trim()
    .notEmpty().withMessage("El número de licencia es obligatorio")
    .isLength({ max: 45 }).withMessage("El número de licencia es demasiado largo"),
  body("fecha_alta_licencia")
    .isISO8601({ strict: true })
    .withMessage("La fecha de alta debe tener formato AAAA-MM-DD"),
  body("fecha_vencimiento_licencia")
    .isISO8601({ strict: true })
    .withMessage("La fecha de vencimiento debe tener formato AAAA-MM-DD")
    .custom((valor, { req }) => {
      if (new Date(valor) <= new Date(req.body.fecha_alta_licencia)) {
        throw new Error("El vencimiento debe ser posterior a la fecha de alta");
      }
      return true;
    }),
];

export const validarFiltrosConductores = [
  query("nombre").optional().trim().isLength({ max: 50 }),
  query("apellido").optional().trim().isLength({ max: 50 }),
  query("numero_documento").optional().trim().isLength({ max: 8 }),
];


/* Viajes */


export const validarViaje = [
  body("vehiculo_id").isInt({ min: 1 }).withMessage("vehiculo_id inválido"),
  body("conductor_id").isInt({ min: 1 }).withMessage("conductor_id inválido"),
  body("fecha_salida")
    .isDate({ format: "YYYY-MM-DD", strictMode: true })
    .withMessage("La fecha de salida debe tener formato AAAA-MM-DD"),
  body("fecha_llegada")
    .isDate({ format: "YYYY-MM-DD", strictMode: true })
    .withMessage("La fecha de llegada debe tener formato AAAA-MM-DD")
    .custom((valor, { req }) => {
      if (new Date(valor) < new Date(req.body.fecha_salida)) {
        throw new Error("La llegada no puede ser anterior a la salida");
      }
      return true;
    }),
  body("origen")
    .trim()
    .notEmpty().withMessage("El origen es obligatorio")
    .isLength({ max: 100 }),
  body("destino")
    .trim()
    .notEmpty().withMessage("El destino es obligatorio")
    .isLength({ max: 100 }),
  body("kilometros")
    .isFloat({ gt: 0 })
    .withMessage("Los kilómetros deben ser un número mayor a 0"),
  body("observaciones")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las observaciones no pueden superar los 500 caracteres"),
];

export const validarFiltrosViajes = [
  query("vehiculo_id").optional().isInt({ min: 1 }).withMessage("vehiculo_id inválido"),
  query("conductor_id").optional().isInt({ min: 1 }).withMessage("conductor_id inválido"),
  query("desde").optional().isISO8601().withMessage("'desde' inválido"),
  query("hasta").optional().isISO8601().withMessage("'hasta' inválido"),
];

// Para el cálculo de kilómetros: hace falta al menos un vehículo o un conductor
export const validarFiltrosKilometros = [
  query("vehiculo_id").optional().isInt({ min: 1 }).withMessage("vehiculo_id inválido"),
  query("conductor_id").optional().isInt({ min: 1 }).withMessage("conductor_id inválido"),
  query().custom((_valor, { req }) => {
    if (!req.query.vehiculo_id && !req.query.conductor_id) {
      throw new Error("Indicá vehiculo_id o conductor_id");
    }
    return true;
  }),
];
