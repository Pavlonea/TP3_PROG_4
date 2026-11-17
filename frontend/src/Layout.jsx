import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Layout() {
  const { pathname } = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const activo = (ruta) => (pathname.startsWith(ruta) ? "active" : "");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <main>
      <nav>
        <ul>
          <li className={pathname === "/" ? "active" : ""}>
            <Link to="/">Inicio</Link>
          </li>

          {isAuthenticated ? (
            <>
              <li className={activo("/vehiculos")}>
                <Link to="/vehiculos">Vehículos</Link>
              </li>
              <li className={activo("/conductores")}>
                <Link to="/conductores">Conductores</Link>
              </li>
              <li className={activo("/viajes")}>
                <Link to="/viajes">Viajes</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Salir</button>
              </li>
            </>
          ) : (
            <>
              <li className={activo("/login")}>
                <Link to="/login">Ingresar</Link>
              </li>
              <li className={activo("/registro")}>
                <Link to="/registro">Registrarse</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <Outlet />
    </main>
  );
}