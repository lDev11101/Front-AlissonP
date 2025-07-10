import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import fetchVentas from "./utils/fetchVentas";
import fetchUsuarios from "./utils/fetchUsuarios";
import fetchTiposVenta from "./utils/fetchTiposVenta";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportesVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tiposVenta, setTiposVenta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    id_usuario: "",
    id_tipo_venta: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [ventasData, usuariosData, tiposData] = await Promise.all([
          fetchVentas(),
          fetchUsuarios(),
          fetchTiposVenta(),
        ]);

        setVentas(ventasData);
        setUsuarios(usuariosData);
        setTiposVenta(tiposData);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos para reportes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const ventasFiltradas = ventas.filter((venta) => {
    const fechaVenta = new Date(venta.fecha);
    return (
      (!filtros.fechaInicio || fechaVenta >= new Date(filtros.fechaInicio)) &&
      (!filtros.fechaFin ||
        fechaVenta <= new Date(filtros.fechaFin + "T23:59:59")) &&
      (!filtros.id_usuario || venta.id_usuario === filtros.id_usuario) &&
      (!filtros.id_tipo_venta || venta.id_tipo_venta === filtros.id_tipo_venta)
    );
  });

  // Datos para gráfico de ventas por día
  const ventasPorDia = ventasFiltradas.reduce((acc, venta) => {
    const fecha = new Date(venta.fecha).toLocaleDateString();
    acc[fecha] = (acc[fecha] || 0) + venta.total;
    return acc;
  }, {});

  const chartDataDias = {
    labels: Object.keys(ventasPorDia),
    datasets: [
      {
        label: "Ventas por día",
        data: Object.values(ventasPorDia),
        backgroundColor: "rgba(168, 212, 32, 0.7)",
        borderColor: "rgba(168, 212, 32, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Datos para gráfico de ventas por vendedor
  const ventasPorVendedor = ventasFiltradas.reduce((acc, venta) => {
    const vendedor =
      usuarios.find((u) => u.id_usuario === venta.id_usuario)?.nombre ||
      "Desconocido";
    acc[vendedor] = (acc[vendedor] || 0) + venta.total;
    return acc;
  }, {});

  const chartDataVendedores = {
    labels: Object.keys(ventasPorVendedor),
    datasets: [
      {
        label: "Ventas por vendedor",
        data: Object.values(ventasPorVendedor),
        backgroundColor: [
          "rgba(168, 212, 32, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Datos para gráfico de ventas por tipo
  const ventasPorTipo = ventasFiltradas.reduce((acc, venta) => {
    const tipo =
      tiposVenta.find((t) => t.id_tipo_venta === venta.id_tipo_venta)
        ?.nombre_tipo || "Desconocido";
    acc[tipo] = (acc[tipo] || 0) + venta.total;
    return acc;
  }, {});

  const chartDataTipos = {
    labels: Object.keys(ventasPorTipo),
    datasets: [
      {
        label: "Ventas por tipo",
        data: Object.values(ventasPorTipo),
        backgroundColor: [
          "rgba(168, 212, 32, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(255, 205, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calcular totales
  const totalVentas = ventasFiltradas.reduce(
    (sum, venta) => sum + venta.total,
    0
  );
  const cantidadVentas = ventasFiltradas.length;
  const promedioVenta = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;

  return (
    <div className="w-full h-full bg-[#181F2A] rounded-b-lg p-4 md:p-8">
      <h2 className="text-3xl font-handwriting text-[#A8D420] mb-6">
        Reportes de Ventas
      </h2>

      {/* Filtros */}
      <div className="mb-6 p-4 border border-[#A8D420] rounded-lg">
        <h3 className="text-xl font-handwriting text-[#A8D420] mb-3">
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Vendedor
            </label>
            <select
              name="id_usuario"
              value={filtros.id_usuario}
              onChange={handleFiltroChange}
              className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
            >
              <option value="">Todos</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#A8D420] font-semibold block mb-1">
              Tipo Venta
            </label>
            <select
              name="id_tipo_venta"
              value={filtros.id_tipo_venta}
              onChange={handleFiltroChange}
              className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
            >
              <option value="">Todos</option>
              {tiposVenta.map((tipo) => (
                <option key={tipo.id_tipo_venta} value={tipo.id_tipo_venta}>
                  {tipo.nombre_tipo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#232B39] p-4 rounded-lg border border-[#A8D420]">
          <h3 className="text-[#A8D420] font-semibold">Total Ventas</h3>
          <p className="text-white text-2xl">${totalVentas.toFixed(2)}</p>
        </div>
        <div className="bg-[#232B39] p-4 rounded-lg border border-[#A8D420]">
          <h3 className="text-[#A8D420] font-semibold">Cantidad Ventas</h3>
          <p className="text-white text-2xl">{cantidadVentas}</p>
        </div>
        <div className="bg-[#232B39] p-4 rounded-lg border border-[#A8D420]">
          <h3 className="text-[#A8D420] font-semibold">Promedio por Venta</h3>
          <p className="text-white text-2xl">${promedioVenta.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráficos */}
      {loading ? (
        <p className="text-white">Cargando reportes...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#232B39] p-4 rounded-lg border border-[#A8D420]">
            <h3 className="text-[#A8D420] font-semibold mb-4">
              Ventas por Día
            </h3>
            <Bar
              data={chartDataDias}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: "#A8D420",
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      color: "#A8D420",
                    },
                    grid: {
                      color: "rgba(168, 212, 32, 0.1)",
                    },
                  },
                  x: {
                    ticks: {
                      color: "#A8D420",
                    },
                    grid: {
                      color: "rgba(168, 212, 32, 0.1)",
                    },
                  },
                },
              }}
            />
          </div>

          <div className="bg-[#232B39] p-4 rounded-lg border border-[#A8D420]">
            <h3 className="text-[#A8D420] font-semibold mb-4">
              Ventas por Vendedor
            </h3>
            <Pie
              data={chartDataVendedores}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: "#A8D420",
                    },
                  },
                },
              }}
            />
          </div>

          <div className="bg-[#232B39] p-4 rounded-lg border border-[#A8D420] md:col-span-2">
            <h3 className="text-[#A8D420] font-semibold mb-4">
              Ventas por Tipo
            </h3>
            <Bar
              data={chartDataTipos}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: "#A8D420",
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      color: "#A8D420",
                    },
                    grid: {
                      color: "rgba(168, 212, 32, 0.1)",
                    },
                  },
                  x: {
                    ticks: {
                      color: "#A8D420",
                    },
                    grid: {
                      color: "rgba(168, 212, 32, 0.1)",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesVentas;
