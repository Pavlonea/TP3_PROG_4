import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "./Auth";

export function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !password) {
      setError("Completá todos los campos");
      return;
    }

    if (!email.includes("@")) {
      setError("El email no es válido");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          password,
        }),
      });

      const datos = await response.json();

      if (!response.ok) {
        setError(
          datos.errores
            ? datos.errores.map((e) => e.msg).join(". ")
            : datos.error,
        );
        return;
      }

      navigate("/login");
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <>
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre:</label>
        <input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Contraseña:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <div>
          <button type="submit">Registrarse</button>
          <Link to="/">
            <button type="button">Volver</button>
          </Link>
        </div>
      </form>
    </>
  );
}