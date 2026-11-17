import { useCallback, useEffect, useState } from "react";
import { API_URL, useAuth } from "./Auth";

const FORM_VACIO = {
  nombre: "",
  apellido: "",
  numero_documento: "",
  numero_licencia: "",
  fecha_alta_licencia: "",
  fecha_vencimiento_licencia: "",
};

// Arma un texto con el error que devuelve la API
function mensajeDeError(datos) {
  if (datos.errores) {
    return datos.errores.map((e) => e.msg).join(". ");
  }
  return datos.error ?? "Ocurrió un error";
}

// La API entrega las fechas como "2020-03-15T03:00:00.000Z".
// Nos quedamos con los primeros 10 caracteres: "2020-03-15".
function soloFecha(fecha) {
  return fecha ? fecha.slice(0, 10) : "";
}

// "2020-03-15" -> "15/03/2020"
function formatearFecha(fecha) {
  const [anio, mes, dia] = soloFecha(fecha).split("-");
  return `${dia}/${mes}/${anio}`;
}

export function Conductores() {
  const { fetchAuth } = useAuth();
  const [conductores, setConductores] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState(null);

  const cargarConductores = useCallback(async () => {
    try {
      const response = await fetchAuth(`${API_URL}/conductores`);
      const datos = await response.json();

      if (!response.ok) {
        setError(mensajeDeError(datos));
        return;
      }

      setConductores(datos);
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  }, [fetchAuth]);

  useEffect(() => {
    cargarConductores();
  }, [cargarConductores]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cancelar = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setError(null);
  };

  // Devuelve un mensaje si hay un dato inválido, o null si está todo bien
  const validar = () => {
    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.numero_documento.trim() ||
      !form.numero_licencia.trim() ||
      !form.fecha_alta_licencia ||
      !form.fecha_vencimiento_licencia
    ) {
      return "Completá todos los campos";
    }

    if (!/^\d{7,8}$/.test(form.numero_documento.trim())) {
      return "El documento debe tener 7 u 8 dígitos";
    }

    if (form.fecha_vencimiento_licencia <= form.fecha_alta_licencia) {
      return "El vencimiento debe ser posterior a la fecha de alta";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mensaje = validar();
    if (mensaje) {
      setError(mensaje);
      return;
    }
    setError(null);

    const conductor = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      numero_documento: form.numero_documento.trim(),
      numero_licencia: form.numero_licencia.trim(),
      fecha_alta_licencia: form.fecha_alta_licencia,
      fecha_vencimiento_licencia: form.fecha_vencimiento_licencia,
    };

    const url = editandoId
      ? `${API_URL}/conductores/${editandoId}`
      : `${API_URL}/conductores`;

    try {
      const response = await fetchAuth(url, {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conductor),
      });
      const datos = await response.json();

      if (!response.ok) {
        setError(mensajeDeError(datos));
        return;
      }

      cancelar();
      cargarConductores();
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  };

  const editar = (c) => {
    setForm({
      nombre: c.nombre,
      apellido: c.apellido,
      numero_documento: c.numero_documento,
      numero_licencia: c.numero_licencia,
      fecha_alta_licencia: soloFecha(c.fecha_alta_licencia),
      fecha_vencimiento_licencia: soloFecha(c.fecha_vencimiento_licencia),
    });
    setEditandoId(c.id);
    setError(null);
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar este conductor?")) {
      return;
    }

    try {
      const response = await fetchAuth(`${API_URL}/conductores/${id}`, {
        method: "DELETE",
      });
      const datos = await response.json();

      if (!response.ok) {
        setError(mensajeDeError(datos));
        return;
      }

      setError(null);
      cargarConductores();
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <>
      <h2>Conductores</h2>

      <h3>{editandoId ? "Modificar conductor" : "Nuevo conductor"}</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre:</label>
        <input
          id="nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <label htmlFor="apellido">Apellido:</label>
        <input
          id="apellido"
          name="apellido"
          value={form.apellido}
          onChange={handleChange}
        />

        <label htmlFor="numero_documento">Número de documento:</label>
        <input
          id="numero_documento"
          name="numero_documento"
          value={form.numero_documento}
          onChange={handleChange}
        />

        <label htmlFor="numero_licencia">Número de licencia:</label>
        <input
          id="numero_licencia"
          name="numero_licencia"
          value={form.numero_licencia}
          onChange={handleChange}
        />

        <label htmlFor="fecha_alta_licencia">Fecha de alta de licencia:</label>
        <input
          id="fecha_alta_licencia"
          name="fecha_alta_licencia"
          type="date"
          value={form.fecha_alta_licencia}
          onChange={handleChange}
        />

        <label htmlFor="fecha_vencimiento_licencia">
          Fecha de vencimiento de licencia:
        </label>
        <input
          id="fecha_vencimiento_licencia"
          name="fecha_vencimiento_licencia"
          type="date"
          value={form.fecha_vencimiento_licencia}
          onChange={handleChange}
        />

        {error && <p className="error">{error}</p>}

        <div>
          <button type="submit">
            {editandoId ? "Guardar cambios" : "Agregar"}
          </button>
          {editandoId && (
            <button type="button" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3>Listado</h3>
      {conductores.length === 0 ? (
        <p>No hay conductores cargados</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Apellido y nombre</th>
              <th>Documento</th>
              <th>Licencia</th>
              <th>Alta</th>
              <th>Vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conductores.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.apellido}, {c.nombre}
                </td>
                <td>{c.numero_documento}</td>
                <td>{c.numero_licencia}</td>
                <td>{formatearFecha(c.fecha_alta_licencia)}</td>
                <td>{formatearFecha(c.fecha_vencimiento_licencia)}</td>
                <td>
                  <button onClick={() => editar(c)}>Editar</button>
                  <button onClick={() => eliminar(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}