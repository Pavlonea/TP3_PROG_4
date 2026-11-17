import { Link } from "react-router";
import { useAuth } from "./Auth";

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <h1>Gestión de transporte</h1>
      <p>
        Aplicación para administrar los vehículos de una empresa de transporte,
        sus conductores y los viajes realizados.
      </p>

      {isAuthenticated ? (
        <>
          <h3>¿Qué querés hacer?</h3>
          <ul>
            <li>
              <Link to="/vehiculos">Administrar vehículos</Link>
            </li>
            <li>
              <Link to="/conductores">Administrar conductores</Link>
            </li>
            <li>
              <Link to="/viajes">Registrar y consultar viajes</Link>
            </li>
          </ul>
        </>
      ) : (
        <p>
          Para usar la aplicación, <Link to="/login">ingresá</Link> o{" "}
          <Link to="/registro">registrate</Link>.
        </p>
      )}
    </>
  );
}