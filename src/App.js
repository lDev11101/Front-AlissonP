import "./styles/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Actividades from "./pages/Actividades";
import Almacen from "./pages/Almacen";
import Productos from "./pages/Productos";
import Usuarios from "./pages/Usuarios";
import Ventas from "./pages/Ventas";
import Registros from "./pages/productos/Registros";
import Reportes from "./pages/productos/Reportes";
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
              <Route path="/almacen" element={<Almacen />} />
              <Route path="/productos" element={<Productos />}>
                <Route index element={<Navigate to="registros" replace />} />
                <Route path="registros" element={<Registros />} />
                <Route path="reportes" element={<Reportes />} />
              </Route>
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/ventas" element={<Ventas />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
