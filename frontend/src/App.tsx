import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Torneos from "./pages/Torneos";
import MisTorneos from "./pages/MisTorneos";
import TorneoDetalle from "./pages/TorneoDetalle";
import Equipos from "./pages/Equipos";
import EquipoDetalle from "./pages/EquipoDetalle";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import TestConnection from "./pages/TestConnection";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/torneos" element={<Torneos />} />
          <Route path="/torneos/:id" element={<TorneoDetalle />} />
          <Route path="/mis-torneos" element={<MisTorneos />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/equipos/:id" element={<EquipoDetalle />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/test-conexion" element={<TestConnection />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
