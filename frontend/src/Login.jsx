import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Login() {
  const { error, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMensaje("Completá el email y la contraseña");
      return;
    }

    if (!email.includes("@")) {
      setMensaje("El email no es válido");
      return;
    }

    setMensaje(null);
    const res = await login(email, password);
    if (res.success) {
      navigate("/");
    }
  };

  return (
    <>
      <h2>Ingresar</h2>
      <form onSubmit={handleSubmit}>
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

        {(mensaje || error) && <p className="error">{mensaje || error}</p>}

        <div>
          <button type="submit">Ingresar</button>
          <Link to="/">
            <button type="button">Volver</button>
          </Link>
        </div>
      </form>
    </>
  );
}