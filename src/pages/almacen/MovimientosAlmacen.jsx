// MovimientosAlmacen.jsx
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import fetchMovimientos from "./utils/fetchMovimientos";
import fetchTiposMovimiento from "./utils/fetchTiposMovimiento";
import fetchProductos from "./utils/fetchProductos";
import crearMovimiento from "./utils/crearMovimiento";
import actualizarMovimiento from "./utils/actualizarMovimiento";
import eliminarMovimiento from "./utils/eliminarMovimiento";

const MovimientosAlmacen = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Formulario principal
  const [form, setForm] = useState({
    fecha: "",
    id_tipo_movimiento: "",
    id_producto: "",
    cantidad: "",
    detalle: "",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Modal y edición
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [itemEditando, setItemEditando] = useState(null);
  const [editForm, setEditForm] = useState({
    fecha: "",
    id_tipo_movimiento: "",
    id_producto: "",
    cantidad: "",
    detalle: "",
  });
  const [editFormError, setEditFormError] = useState(null);

  // Animaciones
  const [formAnim, setFormAnim] = useState("");
  const [modalAnim, setModalAnim] = useState("");

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [movimientosData, tiposData, productosData] = await Promise.all([
        fetchMovimientos(),
        fetchTiposMovimiento(),
        fetchProductos(),
      ]);

      setMovimientos(movimientosData);
      setTiposMovimiento(tiposData);
      setProductos(productosData);
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos. Intenta recargar la página.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Handlers para formulario principal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormError(null);
    setFormSuccess(null);
  };

  // Handlers para formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
    setEditFormError(null);
  };

  // Validar formulario
  const validarForm = (formData) => {
    if (
      !formData.fecha ||
      !formData.id_tipo_movimiento ||
      !formData.id_producto ||
      !formData.cantidad
    ) {
      return "Todos los campos obligatorios deben completarse";
    }
    if (isNaN(Number(formData.cantidad))) {
      return "La cantidad debe ser un número válido";
    }
    return null;
  };

  // Abrir modal de creación
  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validarForm(form);
    if (error) {
      setFormError(error);
      setFormAnim("animate-shake");
      setTimeout(() => setFormAnim(""), 500);
      return;
    }
    setModalType("create");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  // Abrir modal de edición
  const handleEditar = (movimiento) => {
    setItemEditando(movimiento);
    setEditForm({
      fecha: movimiento.fecha.split("T")[0], // Formatear fecha para input
      id_tipo_movimiento: movimiento.id_tipo_movimiento.toString(),
      id_producto: movimiento.id_producto.toString(),
      cantidad: movimiento.cantidad.toString(),
      detalle: movimiento.detalle || "",
    });
    setModalType("edit");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  // Abrir modal de eliminación
  const handleEliminar = (movimiento) => {
    setItemEditando(movimiento);
    setModalType("delete");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  // Confirmar acción (crear/editar/eliminar)
  const handleConfirm = async () => {
    setModalAnim("animate-fadeOutScale");
    setTimeout(async () => {
      setShowModal(false);
      try {
        if (modalType === "create") {
          await crearMovimiento({
            ...form,
            cantidad: Number(form.cantidad),
          });
          setFormSuccess("Movimiento creado correctamente");

          // Resetear formulario
          setForm({
            fecha: "",
            id_tipo_movimiento: "",
            id_producto: "",
            cantidad: "",
            detalle: "",
          });
        } else if (modalType === "edit") {
          await actualizarMovimiento(itemEditando.id_movimiento, {
            ...editForm,
            cantidad: Number(editForm.cantidad),
          });
          setFormSuccess("Movimiento actualizado correctamente");
        } else if (modalType === "delete") {
          await eliminarMovimiento(itemEditando.id_movimiento);
          setFormSuccess("Movimiento eliminado correctamente");
        }

        // Recargar datos
        await cargarDatos();
        setFormAnim("animate-successPulse");
        setTimeout(() => setFormAnim(""), 800);
      } catch (error) {
        setFormError(`Error: ${error.message}`);
        setFormAnim("animate-shake");
        setTimeout(() => setFormAnim(""), 500);
      }
    }, 250);
  };

  // Cancelar acción
  const handleCancel = () => {
    setModalAnim("animate-fadeOutScale");
    setTimeout(() => setShowModal(false), 250);
  };

  // Helper para obtener nombres
  const getNombreTipoMovimiento = (id) => {
    const tipo = tiposMovimiento.find((t) => t.id_tipo_movimiento === id);
    return tipo ? tipo.nombre_tipo : "Desconocido";
  };

  const getNombreProducto = (id) => {
    const producto = productos.find((p) => p.id_producto === id);
    return producto ? producto.nombre_producto : "Desconocido";
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    setExportingExcel(true);

    // Preparar datos
    const datos = movimientos.map((mov) => ({
      ID: mov.id_movimiento,
      Fecha: new Date(mov.fecha).toLocaleDateString(),
      "Tipo de Movimiento": getNombreTipoMovimiento(mov.id_tipo_movimiento),
      Producto: getNombreProducto(mov.id_producto),
      Cantidad: mov.cantidad,
      Detalle: mov.detalle || "",
    }));

    // Crear libro de Excel
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

    // Guardar archivo
    XLSX.writeFile(
      wb,
      `movimientos_almacen_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    setTimeout(() => setExportingExcel(false), 1000);
  };

  return (
    <div className="w-full h-full bg-[#181F2A] rounded-b-lg p-4 md:p-8">
      {/* Botón de exportar Excel */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportToExcel}
          disabled={exportingExcel}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            exportingExcel
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white font-bold transition-colors`}
        >
          {exportingExcel ? (
            <>
              <span className="animate-spin">↻</span> Exportando...
            </>
          ) : (
            <>
              <i className="fi fi-rr-file-excel"></i>
              Exportar a Excel
            </>
          )}
        </button>
      </div>

      <h2 className="text-3xl font-handwriting text-[#A8D420] mb-6">
        Gestión de Movimientos
      </h2>

      {loading ? (
        <p className="text-white">Cargando datos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Formulario Principal */}
          <form
            onSubmit={handleSubmit}
            className={`max-w-lg mx-auto bg-transparent border border-[#A8D420] rounded-lg p-6 flex flex-col gap-4 transition-all duration-300 ${formAnim} mb-8`}
          >
            <label className="text-[#A8D420] font-semibold">
              Fecha
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                required
              />
            </label>

            <label className="text-[#A8D420] font-semibold">
              Tipo de Movimiento
              <select
                name="id_tipo_movimiento"
                value={form.id_tipo_movimiento}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                required
              >
                <option value="">Seleccionar tipo</option>
                {tiposMovimiento.map((tipo) => (
                  <option
                    key={tipo.id_tipo_movimiento}
                    value={tipo.id_tipo_movimiento}
                    className="text-[#fff]"
                  >
                    {tipo.nombre_tipo}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-[#A8D420] font-semibold">
              Producto
              <select
                name="id_producto"
                value={form.id_producto}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                required
              >
                <option value="">Seleccionar producto</option>
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
            </label>

            <label className="text-[#A8D420] font-semibold">
              Cantidad
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                min="1"
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                required
              />
            </label>

            <label className="text-[#A8D420] font-semibold">
              Detalle (Opcional)
              <textarea
                name="detalle"
                value={form.detalle}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                rows="3"
              />
            </label>

            {formError && <p className="text-red-500">{formError}</p>}
            {formSuccess && <p className="text-green-400">{formSuccess}</p>}

            <button
              type="submit"
              className="mt-2 bg-[#A8D420] text-[#181F2A] font-bold py-2 px-4 rounded hover:bg-[#c0e95b] transition-colors"
            >
              Guardar Movimiento
            </button>
          </form>

          {/* Tabla de Movimientos */}
          <div className="max-w-full overflow-x-auto">
            <h3 className="text-2xl font-handwriting text-[#A8D420] mb-4">
              Historial de Movimientos
            </h3>

            {movimientos.length === 0 ? (
              <p className="text-white">No hay movimientos registrados</p>
            ) : (
              <table className="w-full border-collapse border border-[#A8D420] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#232B39] text-[#A8D420]">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Fecha</th>
                    <th className="p-3 text-left">Tipo</th>
                    <th className="p-3 text-left">Producto</th>
                    <th className="p-3 text-left">Cantidad</th>
                    <th className="p-3 text-left">Detalle</th>
                    <th className="p-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov) => (
                    <tr
                      key={mov.id_movimiento}
                      className="border-t border-[#A8D420] hover:bg-[#232B39]/50"
                    >
                      <td className="p-3 text-white">{mov.id_movimiento}</td>
                      <td className="p-3 text-white">
                        {new Date(mov.fecha).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-white">
                        {getNombreTipoMovimiento(mov.id_tipo_movimiento)}
                      </td>
                      <td className="p-3 text-white">
                        {getNombreProducto(mov.id_producto)}
                      </td>
                      <td className="p-3 text-white">{mov.cantidad}</td>
                      <td className="p-3 text-white max-w-xs truncate">
                        {mov.detalle || "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditar(mov)}
                            className="bg-[#A8D420] text-[#181F2A] font-bold py-1 px-2 rounded text-sm hover:bg-[#c0e95b] transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(mov)}
                            className="bg-red-500 text-white font-bold py-1 px-2 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181F2A]/70 animate-fadeIn">
          <div
            className={`bg-[#232B39] border border-[#A8D420] rounded-lg p-8 max-w-md w-full shadow-lg transition-all duration-300 ${modalAnim}`}
          >
            {modalType === "edit" ? (
              <>
                <h3 className="text-xl font-bold text-[#A8D420] mb-4">
                  Editar Movimiento
                </h3>
                <form className="flex flex-col gap-4">
                  <label className="text-[#A8D420] font-semibold">
                    Fecha
                    <input
                      type="date"
                      name="fecha"
                      value={editForm.fecha}
                      onChange={handleEditChange}
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      required
                    />
                  </label>

                  <label className="text-[#A8D420] font-semibold">
                    Tipo de Movimiento
                    <select
                      name="id_tipo_movimiento"
                      value={editForm.id_tipo_movimiento}
                      onChange={handleEditChange}
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      {tiposMovimiento.map((tipo) => (
                        <option
                          key={tipo.id_tipo_movimiento}
                          value={tipo.id_tipo_movimiento}
                          className="text-[#fff]"
                        >
                          {tipo.nombre_tipo}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-[#A8D420] font-semibold">
                    Producto
                    <select
                      name="id_producto"
                      value={editForm.id_producto}
                      onChange={handleEditChange}
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      required
                    >
                      <option value="">Seleccionar producto</option>
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
                  </label>

                  <label className="text-[#A8D420] font-semibold">
                    Cantidad
                    <input
                      type="number"
                      name="cantidad"
                      value={editForm.cantidad}
                      onChange={handleEditChange}
                      min="1"
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      required
                    />
                  </label>

                  <label className="text-[#A8D420] font-semibold">
                    Detalle
                    <textarea
                      name="detalle"
                      value={editForm.detalle}
                      onChange={handleEditChange}
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      rows="3"
                    />
                  </label>

                  {editFormError && (
                    <p className="text-red-500">{editFormError}</p>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 rounded bg-[#232B39] border border-[#A8D420] text-[#A8D420] hover:bg-[#181F2A] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="px-4 py-2 rounded bg-[#A8D420] text-[#181F2A] font-bold hover:opacity-90 transition-colors"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </>
            ) : modalType === "delete" ? (
              <>
                <h3 className="text-xl font-bold text-[#A8D420] mb-4">
                  Confirmar eliminación
                </h3>
                <div className="mb-4 text-[#fff]">
                  <p>
                    ¿Estás seguro de eliminar el movimiento del producto{" "}
                    <span className="font-semibold text-[#A8D420]">
                      {getNombreProducto(itemEditando?.id_producto)}
                    </span>
                    ?
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded bg-[#232B39] border border-[#A8D420] text-[#A8D420] hover:bg-[#181F2A] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 rounded bg-red-500 text-white font-bold hover:opacity-90 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#A8D420] mb-4">
                  Confirmar movimiento
                </h3>
                <div className="mb-4 text-[#fff]">
                  <p>
                    <span className="font-semibold text-[#A8D420]">Tipo:</span>{" "}
                    {getNombreTipoMovimiento(Number(form.id_tipo_movimiento))}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">
                      Producto:
                    </span>{" "}
                    {getNombreProducto(Number(form.id_producto))}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">
                      Cantidad:
                    </span>{" "}
                    {form.cantidad}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">Fecha:</span>{" "}
                    {form.fecha}
                  </p>
                  {form.detalle && (
                    <p>
                      <span className="font-semibold text-[#A8D420]">
                        Detalle:
                      </span>{" "}
                      {form.detalle}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded bg-[#232B39] border border-[#A8D420] text-[#A8D420] hover:bg-[#181F2A] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 rounded bg-[#A8D420] text-[#181F2A] font-bold hover:opacity-90 transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Animaciones */}
      <style>
        {`
          .animate-shake {
            animation: shake 0.4s;
          }
          @keyframes shake {
            10%, 90% { transform: translateX(-2px); }
            20%, 80% { transform: translateX(4px); }
            30%, 50%, 70% { transform: translateX(-8px); }
            40%, 60% { transform: translateX(8px); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeInScale {
            animation: fadeInScale 0.25s;
          }
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.9);}
            to { opacity: 1; transform: scale(1);}
          }
          .animate-fadeOutScale {
            animation: fadeOutScale 0.25s forwards;
          }
          @keyframes fadeOutScale {
            from { opacity: 1; transform: scale(1);}
            to { opacity: 0; transform: scale(0.9);}
          }
          .animate-successPulse {
            animation: successPulse 0.8s;
          }
          @keyframes successPulse {
            0% { box-shadow: 0 0 0 0 #A8D42044; }
            70% { box-shadow: 0 0 0 10px #A8D42000; }
            100% { box-shadow: 0 0 0 0 #A8D42000; }
          }
        `}
      </style>
    </div>
  );
};

export default MovimientosAlmacen;
