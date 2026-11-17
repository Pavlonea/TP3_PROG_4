import { Link, Outlet, useLocation } from "react-router";

export function Layout() {
  const { pathname } = useLocation();

  return (
    <main>
      <nav>
        <ul>
          <li className={pathname === "/" ? "active" : ""}>
            <Link to="/">Inicio</Link>
          </li>
          <li className={pathname.startsWith("/vehiculos") ? "active" : ""}>
            <Link to="/vehiculos">Vehículos</Link>
          </li>
          <li className={pathname.startsWith("/conductores") ? "active" : ""}>
            <Link to="/conductores">Conductores</Link>
          </li>
          <li className={pathname.startsWith("/viajes") ? "active" : ""}>
            <Link to="/viajes">Viajes</Link>
          </li>
          <li className={pathname.startsWith("/login") ? "active" : ""}>
            <Link to="/login">Ingresar</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </main>
  );
}