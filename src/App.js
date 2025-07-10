import "./styles/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Actividades from "./pages/Actividades";
import Almacen from "./pages/Almacen";
import Productos from "./pages/Productos";
import Usuarios from "./pages/Usuarios";
import Ventas from "./pages/Ventas"; // Componente principal de Ventas
import Registros from "./pages/productos/Registros";
import Reportes from "./pages/productos/Reportes";
import UsuariosRegistros from "./pages/usuarios/UsuariosRegistros";
import RegistrosAlmacen from "./pages/almacen/RegistrosAlmacen";
import MovimientosAlmacen from "./pages/almacen/MovimientosAlmacen";
import ReportesAlmacen from "./pages/almacen/ReportesAlmacen";
import RegistrosVentas from "./pages/ventas/RegistrosVentas";
import ReportesVentas from "./pages/ventas/ReportesVentas";
import "@flaticon/flaticon-uicons/css/all/all.css";

function App() {
  return (
    <div className="App min-h-screen min-w-screen bg-[#181F2A]">
      <BrowserRouter>
        <div className="flex min-h-screen min-w-screen">
          <Sidebar />
          <main className="flex-1 p-6 bg-[#181F2A] min-h-screen min-w-0 text-white">
            <Routes>
              <Route path="/actividades" element={<Actividades />} />
              <Route path="/almacen" element={<Almacen />}>
                <Route index element={<Navigate to="registros" replace />} />
                <Route path="registros" element={<RegistrosAlmacen />} />
                <Route path="movimientos" element={<MovimientosAlmacen />} />
                <Route path="reportes" element={<ReportesAlmacen />} />
              </Route>
              <Route path="/productos" element={<Productos />}>
                <Route index element={<Navigate to="registros" replace />} />
                <Route path="registros" element={<Registros />} />
                <Route path="reportes" element={<Reportes />} />
              </Route>
              <Route path="/usuarios" element={<Usuarios />}>
                <Route index element={<Navigate to="registros" replace />} />
                <Route path="registros" element={<UsuariosRegistros />} />
              </Route>
              {/* Módulo de Ventas actualizado */}
              <Route path="/ventas" element={<Ventas />}>
                <Route index element={<Navigate to="registros" replace />} />
                <Route path="registros" element={<RegistrosVentas />} />
                <Route path="reportes" element={<ReportesVentas />} />
              </Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
