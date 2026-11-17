import { useCallback, useEffect, useState } from "react";
import { API_URL, useAuth } from "./Auth";

const FORM_VACIO = {
  marca: "",
  modelo: "",
  patente: "",
  anio: "",
  capacidad_carga: "",
};

// Arma un texto con el error que devuelve la API
function mensajeDeError(datos) {
  if (datos.errores) {
    return datos.errores.map((e) => e.msg).join(". ");
  }
  return datos.error ?? "Ocurrió un error";
}

export function Vehiculos() {
  const { fetchAuth } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState(null);

  const cargarVehiculos = useCallback(async () => {
    try {
      const response = await fetchAuth(`${API_URL}/vehiculos`);
      const datos = await response.json();

      if (!response.ok) {
        setError(mensajeDeError(datos));
        return;
      }

      setVehiculos(datos);
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  }, [fetchAuth]);

  useEffect(() => {
    cargarVehiculos();
  }, [cargarVehiculos]);

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
    const anioMaximo = new Date().getFullYear() + 1;

    if (
      !form.marca.trim() ||
      !form.modelo.trim() ||
      !form.patente.trim() ||
      !form.anio ||
      !form.capacidad_carga
    ) {
      return "Completá todos los campos";
    }

    if (!/^([A-Za-z]{3}\d{3}|[A-Za-z]{2}\d{3}[A-Za-z]{2})$/.test(form.patente.trim())) {
      return "La patente debe tener formato ABC123 o AB123CD";
    }

    const anio = Number(form.anio);
    if (!Number.isInteger(anio) || anio < 1900 || anio > anioMaximo) {
      return `El año debe estar entre 1900 y ${anioMaximo}`;
    }

    if (!(Number(form.capacidad_carga) > 0)) {
      return "La capacidad de carga debe ser mayor a 0";
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

    const vehiculo = {
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      patente: form.patente.trim().toUpperCase(),
      anio: Number(form.anio),
      capacidad_carga: Number(form.capacidad_carga),
    };

    const url = editandoId
      ? `${API_URL}/vehiculos/${editandoId}`
      : `${API_URL}/vehiculos`;

    try {
      const response = await fetchAuth(url, {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehiculo),
      });
      const datos = await response.json();

      if (!response.ok) {
        setError(mensajeDeError(datos));
        return;
      }

      cancelar();
      cargarVehiculos();
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  };

  const editar = (v) => {
    setForm({
      marca: v.marca,
      modelo: v.modelo,
      patente: v.patente,
      anio: String(v.anio),
      capacidad_carga: String(v.capacidad_carga),
    });
    setEditandoId(v.id);
    setError(null);
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar este vehículo?")) {
      return;
    }

    try {
      const response = await fetchAuth(`${API_URL}/vehiculos/${id}`, {
        method: "DELETE",
      });
      const datos = await response.json();

      if (!response.ok) {
        setError(mensajeDeError(datos));
        return;
      }

      setError(null);
      cargarVehiculos();
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <>
      <h2>Vehículos</h2>

      <h3>{editandoId ? "Modificar vehículo" : "Nuevo vehículo"}</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="marca">Marca:</label>
        <input
          id="marca"
          name="marca"
          value={form.marca}
          onChange={handleChange}
        />

        <label htmlFor="modelo">Modelo:</label>
        <input
          id="modelo"
          name="modelo"
          value={form.modelo}
          onChange={handleChange}
        />

        <label htmlFor="patente">Patente:</label>
        <input
          id="patente"
          name="patente"
          value={form.patente}
          onChange={handleChange}
        />

        <label htmlFor="anio">Año:</label>
        <input
          id="anio"
          name="anio"
          type="number"
          value={form.anio}
          onChange={handleChange}
        />

        <label htmlFor="capacidad_carga">Capacidad de carga (kg):</label>
        <input
          id="capacidad_carga"
          name="capacidad_carga"
          type="number"
          value={form.capacidad_carga}
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
      {vehiculos.length === 0 ? (
        <p>No hay vehículos cargados</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Patente</th>
              <th>Año</th>
              <th>Capacidad (kg)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id}>
                <td>{v.marca}</td>
                <td>{v.modelo}</td>
                <td>{v.patente}</td>
                <td>{v.anio}</td>
                <td>{v.capacidad_carga}</td>
                <td>
                  <button onClick={() => editar(v)}>Editar</button>
                  <button onClick={() => eliminar(v.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}