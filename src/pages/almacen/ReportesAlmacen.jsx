// ReportesAlmacen.jsx
import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import fetchMovimientos from "./utils/fetchMovimientos";
import fetchProductos from "./utils/fetchProductos";

// Solución para el warning de source map
try {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
} catch (e) {
  console.warn("Chart.js register warning:", e.message);
}

const ReportesAlmacen = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    id_producto: "",
  });

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [movimientosData, productosData] = await Promise.all([
          fetchMovimientos(),
          fetchProductos(),
        ]);

        setMovimientos(movimientosData);
        setProductos(productosData);
        setError(null);
      } catch (err) {
        setError("Error al cargar reportes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Aplicar filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  // Datos filtrados
  const movimientosFiltrados = movimientos.filter((mov) => {
    const fechaMov = new Date(mov.fecha);
    const cumpleFecha =
      (!filtros.fechaInicio || fechaMov >= new Date(filtros.fechaInicio)) &&
      (!filtros.fechaFin ||
        fechaMov <= new Date(filtros.fechaFin + "T23:59:59"));

    const cumpleProducto =
      !filtros.id_producto || mov.id_producto === Number(filtros.id_producto);

    return cumpleFecha && cumpleProducto;
  });

  // Preparar datos para gráficos
  const prepararDatosGrafico = () => {
    const datosPorTipo = {};

    movimientosFiltrados.forEach((mov) => {
      const tipo = mov.id_tipo_movimiento;
      if (!datosPorTipo[tipo]) {
        datosPorTipo[tipo] = 0;
      }
      datosPorTipo[tipo] += mov.cantidad;
    });

    return {
      labels: Object.keys(datosPorTipo).map(
        (id) =>
          tiposMovimiento.find((t) => t.id_tipo_movimiento === Number(id))
            ?.nombre_tipo || id
      ),
      datasets: [
        {
          label: "Cantidad Movida",
          data: Object.values(datosPorTipo),
          backgroundColor: "#A8D420",
          borderColor: "#181F2A",
          borderWidth: 1,
        },
      ],
    };
  };

  const tiposMovimiento = [
    { id_tipo_movimiento: 1, nombre_tipo: "Entrada" },
    { id_tipo_movimiento: 2, nombre_tipo: "Salida" },
    { id_tipo_movimiento: 3, nombre_tipo: "Ajuste" },
  ];

  const getNombreProducto = (id) => {
    const producto = productos.find((p) => p.id_producto === id);
    return producto ? producto.nombre_producto : "Desconocido";
  };

  return (
    <div className="w-full h-full bg-[#181F2A] rounded-b-lg p-4 md:p-8">
      {/* Contenedor del reporte (ref para capturar en PDF) */}
      <div ref={reportRef} className="bg-[#181F2A] p-4">
        <h2 className="text-3xl font-handwriting text-[#A8D420] mb-6">
          Reportes de Almacén
        </h2>

        {/* Filtros */}
        <div className="mb-8 p-6 border border-[#A8D420] rounded-lg">
          <h3 className="text-xl font-handwriting text-[#A8D420] mb-4">
            Filtros
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[#A8D420] font-semibold block mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
                className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#A8D420] font-semibold block mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                name="fechaFin"
                value={filtros.fechaFin}
                onChange={handleFiltroChange}
                className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#A8D420] font-semibold block mb-1">
                Producto
              </label>
              <select
                name="id_producto"
                value={filtros.id_producto}
                onChange={handleFiltroChange}
                className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
              >
                <option value="">Todos los productos</option>
                {productos.map((prod) => (
                  <option
                    key={prod.id_producto}
                    value={prod.id_producto}
                    className="text-[#fff]"
                  >
                    {prod.nombre_producto}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-white">Cargando reportes...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-8">
            {/* Gráfico con ID para referencia */}
            <div className="bg-[#232B39] p-6 rounded-lg border border-[#A8D420]">
              <h3 className="text-xl font-handwriting text-[#A8D420] mb-4">
                Movimientos por Tipo
              </h3>
              <div className="h-64">
                <Bar
                  id="chart-movimientos" // ID importante para la captura
                  data={prepararDatosGrafico()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#A8D420",
                          font: {
                            size: 14,
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        ticks: {
                          color: "#A8D420",
                          font: {
                            size: 12,
                          },
                        },
                        grid: {
                          color: "#2D3748",
                          borderColor: "#A8D420",
                        },
                      },
                      x: {
                        ticks: {
                          color: "#A8D420",
                          font: {
                            size: 12,
                          },
                        },
                        grid: {
                          color: "#2D3748",
                          borderColor: "#A8D420",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Tabla de Movimientos */}
            <div>
              <h3 className="text-xl font-handwriting text-[#A8D420] mb-4">
                Detalle de Movimientos
                <span className="text-sm text-gray-400 ml-2">
                  ({movimientosFiltrados.length} registros)
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-[#A8D420] rounded-lg">
                  <thead>
                    <tr className="bg-[#232B39] text-[#A8D420]">
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Fecha</th>
                      <th className="p-3 text-left">Tipo</th>
                      <th className="p-3 text-left">Producto</th>
                      <th className="p-3 text-left">Cantidad</th>
                      <th className="p-3 text-left">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-white">
                          No se encontraron movimientos con los filtros
                          aplicados
                        </td>
                      </tr>
                    ) : (
                      movimientosFiltrados.map((mov) => (
                        <tr
                          key={mov.id_movimiento}
                          className="border-t border-[#A8D420] hover:bg-[#232B39]/50"
                        >
                          <td className="p-3 text-white">
                            {mov.id_movimiento}
                          </td>
                          <td className="p-3 text-white">
                            {new Date(mov.fecha).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-white">
                            {tiposMovimiento.find(
                              (t) =>
                                t.id_tipo_movimiento === mov.id_tipo_movimiento
                            )?.nombre_tipo || "Desconocido"}
                          </td>
                          <td className="p-3 text-white">
                            {getNombreProducto(mov.id_producto)}
                          </td>
                          <td className="p-3 text-white">{mov.cantidad}</td>
                          <td className="p-3 text-white max-w-xs">
                            {mov.detalle || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesAlmacen;
