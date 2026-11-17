import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import { Layout } from "./Layout";
import { Home } from "./Home";
import { Login } from "./Login";
import { Vehiculos } from "./Vehiculos";
import { Conductores } from "./Conductores";
import { Viajes } from "./Viajes";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="vehiculos" element={<Vehiculos />} />
          <Route path="conductores" element={<Conductores />} />
          <Route path="viajes" element={<Viajes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);