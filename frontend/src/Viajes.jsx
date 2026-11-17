import { useCallback, useEffect, useState } from "react";
import { API_URL, useAuth } from "./Auth";

const FORM_VACIO = {
  vehiculo_id: "",
  conductor_id: "",
  fecha_salida: "",
  fecha_llegada: "",
  origen: "",
  destino: "",
  kilometros: "",
  observaciones: "",
};

// Arma un texto con el error que devuelve la API
function mensajeDeError(datos) {
  if (datos.errores) {
    return datos.errores.map((e) => e.msg).join(". ");
  }
  return datos.error ?? "Ocurrió un error";
}

// "2026-11-10T03:00:00.000Z" -> "10/11/2026"
function formatearFecha(fecha) {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}

export function Viajes() {
  const { fetchAuth } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState(null);
  const [filtroVehiculo, setFiltroVehiculo] = useState("");
  const [filtroConductor, setFiltroConductor] = useState("");

  const cargarListas = useCallback(async () => {
    try {
      const [resVehiculos, resConductores] = await Promise.all([
        fetchAuth(`${API_URL}/vehiculos`),
        fetchAuth(`${API_URL}/conductores`),
      ]);

      if (!resVehiculos.ok || !resConductores.ok) {
        setError("No se pudieron cargar los datos");
        return;
      }

      setVehiculos(await resVehiculos.json());
      setConductores(await resConductores.json());
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  }, [fetchAuth]);

  const cargarViajes = useCallback(async () => {
    const params = new URLSearchParams();
    if (filtroVehiculo) params.append("vehiculo_id", filtroVehiculo);
    if (filtroConductor) params.append("conductor_id", filtroConductor);

    try {
      const response = await fetchAuth(`${API_URL}/viajes?${params}`);

      if (!response.ok) {
        setError("No se pudo cargar el historial");
        return;
      }

      setViajes(await response.json());
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  }, [fetchAuth, filtroVehiculo, filtroConductor]);

  useEffect(() => {
    cargarListas();
  }, [cargarListas]);

  useEffect(() => {
    cargarViajes();
  }, [cargarViajes]);

  const totalKm = viajes.reduce((suma, v) => suma + Number(v.kilometros), 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Devuelve un mensaje si hay un dato inválido, o null si está todo bien
  const validar = () => {
    if (
      !form.vehiculo_id ||
      !form.conductor_id ||
      !form.fecha_salida ||
      !form.fecha_llegada ||
      !form.origen.trim() ||
      !form.destino.trim() ||
      !form.kilometros
    ) {
      return "Completá todos los campos obligatorios";
    }

    if (form.fecha_llegada < form.fecha_salida) {
      return "La llegada no puede ser anterior a la salida";
    }

    if (!(Number(form.kilometros) > 0)) {
      return "Los kilómetros deben ser mayores a 0";
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

    const viaje = {
      vehiculo_id: Number(form.vehiculo_id),
      conductor_id: Number(form.conductor_id),
      fecha_salida: form.fecha_salida,
      fecha_llegada: form.fecha_llegada,
      origen: form.origen.trim(),
      destino: form.destino.trim(),
      kilometros: Number(form.kilometros),
      observaciones: form.observaciones.trim() || null,
    };

    try {
      const response = await fetchAuth(`${API_URL}/viajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(viaje),
      });
      const datos = await response.json();

      if (!response.ok) {
        setError(mensajeDeError(datos));
        return;
      }

      setForm(FORM_VACIO);
      cargarViajes();
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <>
      <h2>Viajes</h2>

      <h3>Registrar viaje</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="vehiculo_id">Vehículo:</label>
        <select
          id="vehiculo_id"
          name="vehiculo_id"
          value={form.vehiculo_id}
          onChange={handleChange}
        >
          <option value="">Seleccionar vehículo</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.patente} - {v.marca} {v.modelo}
            </option>
          ))}
        </select>

        <label htmlFor="conductor_id">Conductor:</label>
        <select
          id="conductor_id"
          name="conductor_id"
          value={form.conductor_id}
          onChange={handleChange}
        >
          <option value="">Seleccionar conductor</option>
          {conductores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.apellido}, {c.nombre}
            </option>
          ))}
        </select>

        <label htmlFor="fecha_salida">Fecha de salida:</label>
        <input
          id="fecha_salida"
          name="fecha_salida"
          type="date"
          value={form.fecha_salida}
          onChange={handleChange}
        />

        <label htmlFor="fecha_llegada">Fecha de llegada:</label>
        <input
          id="fecha_llegada"
          name="fecha_llegada"
          type="date"
          value={form.fecha_llegada}
          onChange={handleChange}
        />

        <label htmlFor="origen">Origen:</label>
        <input
          id="origen"
          name="origen"
          value={form.origen}
          onChange={handleChange}
        />

        <label htmlFor="destino">Destino:</label>
        <input
          id="destino"
          name="destino"
          value={form.destino}
          onChange={handleChange}
        />

        <label htmlFor="kilometros">Kilómetros:</label>
        <input
          id="kilometros"
          name="kilometros"
          type="number"
          value={form.kilometros}
          onChange={handleChange}
        />

        <label htmlFor="observaciones">Observaciones (opcional):</label>
        <input
          id="observaciones"
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
        />

        {error && <p className="error">{error}</p>}

        <div>
          <button type="submit">Registrar</button>
        </div>
      </form>

      <h3>Historial de viajes</h3>

      <label htmlFor="filtroVehiculo">Filtrar por vehículo:</label>
      <select
        id="filtroVehiculo"
        value={filtroVehiculo}
        onChange={(e) => setFiltroVehiculo(e.target.value)}
      >
        <option value="">Todos</option>
        {vehiculos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.patente} - {v.marca} {v.modelo}
          </option>
        ))}
      </select>

      <label htmlFor="filtroConductor">Filtrar por conductor:</label>
      <select
        id="filtroConductor"
        value={filtroConductor}
        onChange={(e) => setFiltroConductor(e.target.value)}
      >
        <option value="">Todos</option>
        {conductores.map((c) => (
          <option key={c.id} value={c.id}>
            {c.apellido}, {c.nombre}
          </option>
        ))}
      </select>

      <p>
        <strong>Total de kilómetros: {totalKm}</strong> ({viajes.length}{" "}
        viajes)
      </p>

      {viajes.length === 0 ? (
        <p>No hay viajes registrados</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Salida</th>
              <th>Llegada</th>
              <th>Vehículo</th>
              <th>Conductor</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Km</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {viajes.map((v) => (
              <tr key={v.id}>
                <td>{formatearFecha(v.fecha_salida)}</td>
                <td>{formatearFecha(v.fecha_llegada)}</td>
                <td>{v.patente}</td>
                <td>
                  {v.conductor_apellido}, {v.conductor_nombre}
                </td>
                <td>{v.origen}</td>
                <td>{v.destino}</td>
                <td>{v.kilometros}</td>
                <td>{v.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}