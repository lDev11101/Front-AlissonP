import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import fetchVentas from "./utils/fetchVentas";
import fetchUsuarios from "./utils/fetchUsuarios";
import fetchTiposVenta from "./utils/fetchTiposVenta";
import fetchProductos from "./utils/fetchProductos";
import crearVenta from "./utils/crearVenta";
import eliminarVenta from "./utils/eliminarVenta";
import crearDetalleVenta from "./utils/crearDetalleVenta";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = "http://127.0.0.1:5000/api";

const RegistrosVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tiposVenta, setTiposVenta] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ventaDetalles, setVentaDetalles] = useState(null);

  // Formulario de venta
  const [formVenta, setFormVenta] = useState({
    fecha: new Date().toISOString().split("T")[0],
    id_usuario: "",
    id_tipo_venta: "",
    total: 0,
    detalles: [
      {
        id_producto: "",
        cantidad: 1,
        precio_unitario: 0,
      },
    ],
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    id_usuario: "",
    id_tipo_venta: "",
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [ventasData, usuariosData, tiposData, productosData] =
          await Promise.all([
            fetchVentas(),
            fetchUsuarios(),
            fetchTiposVenta(),
            fetchProductos(),
          ]);

        setVentas(ventasData);
        setUsuarios(usuariosData);
        setTiposVenta(tiposData);
        setProductos(productosData);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos de ventas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para mostrar detalles de venta
  const mostrarDetallesVenta = async (venta) => {
    try {
      let ventaConDetalles = { ...venta };

      // Si no tiene detalles o es un array vacío, cargarlos
      if (
        !ventaConDetalles.detalles ||
        ventaConDetalles.detalles.length === 0
      ) {
        const response = await fetch(
          `${API_BASE_URL}/ventas/${ventaConDetalles.id_venta}/detalle`
        );
        if (response.ok) {
          const detalles = await response.json();
          ventaConDetalles.detalles = detalles;
        } else {
          ventaConDetalles.detalles = [];
        }
      }

      setVentaDetalles(ventaConDetalles);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      setError("Error al cargar los detalles de la venta");
      setVentaDetalles({
        ...venta,
        detalles: [],
      });
    }
  };

  // Manejar cambios en filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Aplicar filtros
  const ventasFiltradas = ventas.filter((venta) => {
    const fechaVenta = new Date(venta.fecha);
    const cumpleFiltroFechaInicio =
      !filtros.fechaInicio || fechaVenta >= new Date(filtros.fechaInicio);
    const cumpleFiltroFechaFin =
      !filtros.fechaFin ||
      fechaVenta <= new Date(filtros.fechaFin + "T23:59:59");
    const cumpleFiltroUsuario =
      !filtros.id_usuario ||
      venta.id_usuario.toString() === filtros.id_usuario.toString();
    const cumpleFiltroTipo =
      !filtros.id_tipo_venta ||
      venta.id_tipo_venta.toString() === filtros.id_tipo_venta.toString();

    return (
      cumpleFiltroFechaInicio &&
      cumpleFiltroFechaFin &&
      cumpleFiltroUsuario &&
      cumpleFiltroTipo
    );
  });

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormVenta({ ...formVenta, [name]: value });
  };

  // Manejar cambios en los detalles
  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosDetalles = [...formVenta.detalles];
    nuevosDetalles[index][name] = value;

    // Actualizar precio si cambia el producto
    if (name === "id_producto") {
      const producto = productos.find((p) => p.id_producto === value);
      if (producto) {
        nuevosDetalles[index].precio_unitario = producto.precio_base;
      }
    }

    setFormVenta({ ...formVenta, detalles: nuevosDetalles });

    // Recalcular total
    if (
      name === "cantidad" ||
      name === "precio_unitario" ||
      name === "id_producto"
    ) {
      calcularTotal(nuevosDetalles);
    }
  };

  // Agregar nuevo detalle
  const agregarDetalle = () => {
    setFormVenta({
      ...formVenta,
      detalles: [
        ...formVenta.detalles,
        { id_producto: "", cantidad: 1, precio_unitario: 0 },
      ],
    });
  };

  // Eliminar detalle
  const eliminarDetalle = (index) => {
    if (formVenta.detalles.length <= 1) return;

    const nuevosDetalles = [...formVenta.detalles];
    nuevosDetalles.splice(index, 1);

    setFormVenta({ ...formVenta, detalles: nuevosDetalles });
    calcularTotal(nuevosDetalles);
  };

  // Calcular total de la venta
  const calcularTotal = (detalles) => {
    const total = detalles.reduce((sum, detalle) => {
      return (
        sum +
        (Number(detalle.cantidad) || 0) * (Number(detalle.precio_unitario) || 0)
      );
    }, 0);

    setFormVenta({ ...formVenta, total });
  };

  // Enviar nueva venta
  const handleSubmitVenta = async (e) => {
    e.preventDefault();

    try {
      // Crear venta principal
      const ventaCreada = await crearVenta({
        fecha: formVenta.fecha,
        id_usuario: formVenta.id_usuario,
        id_tipo_venta: formVenta.id_tipo_venta,
        total: formVenta.total,
      });

      // Crear detalles
      for (const detalle of formVenta.detalles) {
        await crearDetalleVenta(ventaCreada.id_venta, {
          id_producto: detalle.id_producto,
          cantidad: Number(detalle.cantidad),
          precio_unitario: Number(detalle.precio_unitario),
        });
      }

      // Actualizar lista de ventas
      const nuevasVentas = await fetchVentas();
      setVentas(nuevasVentas);
      setShowModal(false);

      // Resetear formulario
      setFormVenta({
        fecha: new Date().toISOString().split("T")[0],
        id_usuario: "",
        id_tipo_venta: "",
        total: 0,
        detalles: [
          {
            id_producto: "",
            cantidad: 1,
            precio_unitario: 0,
          },
        ],
      });
    } catch (error) {
      console.error("Error al crear venta:", error);
      setError(`Error al registrar la venta: ${error.message}`);
    }
  };

  // Eliminar venta
  const handleEliminarVenta = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta venta?")) return;

    try {
      await eliminarVenta(id);
      setVentas(ventas.filter((v) => v.id_venta !== id));
    } catch (error) {
      console.error("Error al eliminar venta:", error);
      setError("Error al eliminar la venta");
    }
  };

  // Obtener nombre de usuario
  const getNombreUsuario = (id) => {
    const usuario = usuarios.find((u) => u.id_usuario === id);
    return usuario ? usuario.nombre : "Desconocido";
  };

  // Obtener nombre de tipo de venta
  const getTipoVenta = (id) => {
    const tipo = tiposVenta.find((t) => t.id_tipo_venta === id);
    return tipo ? tipo.nombre_tipo : "Desconocido";
  };

  // Obtener nombre de producto
  const getNombreProducto = (id) => {
    const producto = productos.find((p) => p.id_producto === id);
    return producto ? producto.nombre_producto : "Desconocido";
  };

  return (
    <div className="w-full h-full bg-[#181F2A] rounded-b-lg p-4 md:p-8">
      <h2 className="text-3xl font-handwriting text-[#A8D420] mb-6">
        Gestión de Ventas
      </h2>

      {/* Botón Nueva Venta */}
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#A8D420] text-[#181F2A] font-bold py-2 px-4 rounded hover:bg-[#c0e95b] transition-colors"
        >
          <i className="fi fi-rr-plus mr-2"></i>
          Nueva Venta
        </button>
      </div>

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
                <option
                  key={usuario.id_usuario}
                  value={usuario.id_usuario.toString()}
                >
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
                <option
                  key={tipo.id_tipo_venta}
                  value={tipo.id_tipo_venta.toString()}
                >
                  {tipo.nombre_tipo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Ventas */}
      {loading ? (
        <p className="text-white">Cargando ventas...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[#A8D420] rounded-lg">
            <thead>
              <tr className="bg-[#232B39] text-[#A8D420]">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Vendedor</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-white">
                    No se encontraron ventas con los filtros aplicados
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((venta) => {
                  const fecha = new Date(venta.fecha);
                  return (
                    <tr
                      key={venta.id_venta}
                      className="border-t border-[#A8D420] hover:bg-[#232B39]/50"
                    >
                      <td className="p-3 text-white">{venta.id_venta}</td>
                      <td className="p-3 text-white">
                        {fecha.toLocaleDateString()}
                      </td>
                      <td className="p-3 text-white">
                        {getNombreUsuario(venta.id_usuario)}
                      </td>
                      <td className="p-3 text-white">
                        {getTipoVenta(venta.id_tipo_venta)}
                      </td>
                      <td className="p-3 text-white">
                        ${venta.total?.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => mostrarDetallesVenta(venta)}
                            className="bg-[#A8D420] text-[#181F2A] font-bold py-1 px-2 rounded text-sm hover:bg-[#c0e95b] transition-colors"
                          >
                            Detalles
                          </button>
                          <button
                            onClick={() => handleEliminarVenta(venta.id_venta)}
                            className="bg-red-500 text-white font-bold py-1 px-2 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva Venta */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#232B39] border border-[#A8D420] rounded-lg p-6 w-full max-w-3xl">
            <h3 className="text-2xl font-handwriting text-[#A8D420] mb-4">
              Registrar Nueva Venta
            </h3>

            <form onSubmit={handleSubmitVenta}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-[#A8D420] font-semibold block mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formVenta.fecha}
                    onChange={handleFormChange}
                    className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#A8D420] font-semibold block mb-1">
                    Vendedor
                  </label>
                  <select
                    name="id_usuario"
                    value={formVenta.id_usuario}
                    onChange={handleFormChange}
                    className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                    required
                  >
                    <option value="">Seleccionar vendedor</option>
                    {usuarios.map((usuario) => (
                      <option
                        key={usuario.id_usuario}
                        value={usuario.id_usuario}
                      >
                        {usuario.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#A8D420] font-semibold block mb-1">
                    Tipo de Venta
                  </label>
                  <select
                    name="id_tipo_venta"
                    value={formVenta.id_tipo_venta}
                    onChange={handleFormChange}
                    className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposVenta.map((tipo) => (
                      <option
                        key={tipo.id_tipo_venta}
                        value={tipo.id_tipo_venta}
                      >
                        {tipo.nombre_tipo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[#A8D420] mb-3">
                  Productos
                </h4>

                {formVenta.detalles.map((detalle, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3"
                  >
                    <div>
                      <label className="text-[#A8D420] font-semibold block mb-1">
                        Producto
                      </label>
                      <select
                        name="id_producto"
                        value={detalle.id_producto}
                        onChange={(e) => handleDetalleChange(index, e)}
                        className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                        required
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map((producto) => (
                          <option
                            key={producto.id_producto}
                            value={producto.id_producto}
                          >
                            {producto.nombre_producto}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[#A8D420] font-semibold block mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        name="cantidad"
                        min="1"
                        value={detalle.cantidad}
                        onChange={(e) => handleDetalleChange(index, e)}
                        className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[#A8D420] font-semibold block mb-1">
                        Precio Unitario
                      </label>
                      <input
                        type="number"
                        name="precio_unitario"
                        min="0"
                        step="0.01"
                        value={detalle.precio_unitario}
                        onChange={(e) => handleDetalleChange(index, e)}
                        className="w-full p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => eliminarDetalle(index)}
                        className="bg-red-500 text-white font-bold py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        <i className="fi fi-rr-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={agregarDetalle}
                  className="mt-2 bg-[#232B39] border border-[#A8D420] text-[#A8D420] font-bold py-2 px-4 rounded hover:bg-[#181F2A] transition-colors"
                >
                  <i className="fi fi-rr-plus mr-2"></i>
                  Agregar Producto
                </button>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div>
                  <h4 className="text-xl font-semibold text-[#A8D420]">
                    Total: ${formVenta.total.toFixed(2)}
                  </h4>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded bg-[#232B39] border border-[#A8D420] text-[#A8D420] hover:bg-[#181F2A] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#A8D420] text-[#181F2A] font-bold hover:opacity-90 transition-colors"
                  >
                    Guardar Venta
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalles Venta */}
      {ventaDetalles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#232B39] border border-[#A8D420] rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-handwriting text-[#A8D420]">
                Detalles de Venta #{ventaDetalles.id_venta}
              </h3>
              <button
                onClick={() => setVentaDetalles(null)}
                className="text-[#A8D420] hover:text-white"
              >
                <i className="fi fi-rr-cross text-xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[#A8D420] font-semibold">Fecha</p>
                <p className="text-white">
                  {new Date(ventaDetalles.fecha).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-[#A8D420] font-semibold">Vendedor</p>
                <p className="text-white">
                  {getNombreUsuario(ventaDetalles.id_usuario)}
                </p>
              </div>

              <div>
                <p className="text-[#A8D420] font-semibold">Tipo de Venta</p>
                <p className="text-white">
                  {getTipoVenta(ventaDetalles.id_tipo_venta)}
                </p>
              </div>

              <div>
                <p className="text-[#A8D420] font-semibold">Total</p>
                <p className="text-white text-xl font-bold">
                  $
                  {ventaDetalles.total
                    ? ventaDetalles.total.toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-[#A8D420] mb-3">
                Productos Vendidos
              </h4>

              {ventaDetalles.detalles && ventaDetalles.detalles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#2D3748] text-[#A8D420]">
                        <th className="p-2 text-left">Producto</th>
                        <th className="p-2 text-left">Cantidad</th>
                        <th className="p-2 text-left">Precio Unitario</th>
                        <th className="p-2 text-left">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventaDetalles.detalles.map((detalle, index) => (
                        <tr
                          key={index}
                          className="border-b border-[#A8D420]/30 hover:bg-[#2D3748]/50"
                        >
                          <td className="p-2 text-white">
                            {getNombreProducto(detalle.id_producto)}
                          </td>
                          <td className="p-2 text-white">{detalle.cantidad}</td>
                          <td className="p-2 text-white">
                            $
                            {typeof detalle.precio_unitario === "number"
                              ? detalle.precio_unitario.toFixed(2)
                              : "0.00"}
                          </td>
                          <td className="p-2 text-white font-semibold">
                            $
                            {typeof detalle.cantidad === "number" &&
                            typeof detalle.precio_unitario === "number"
                              ? (
                                  detalle.cantidad * detalle.precio_unitario
                                ).toFixed(2)
                              : "0.00"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-white text-center py-4">
                  No se encontraron productos en esta venta
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrosVentas;
