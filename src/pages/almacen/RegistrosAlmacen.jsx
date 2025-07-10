import React, { useEffect, useState } from "react";
import fetchInventario from "./utils/fetchInventario";
import fetchProductos from "./utils/fetchProductos";
import crearInventario from "./utils/crearInventario";
import actualizarInventario from "./utils/actualizarInventario";
import eliminarInventario from "./utils/eliminarInventario";

const RegistrosAlmacen = () => {
  const [productos, setProductos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formulario principal
  const [form, setForm] = useState({
    id_producto: "",
    fecha_vencimiento: "",
    codigo_lote: "",
    cantidad_disponible: "",
    alerta_vencimiento: false,
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Modal y formulario de edición
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [itemEditando, setItemEditando] = useState(null);
  const [editForm, setEditForm] = useState({
    id_producto: "",
    fecha_vencimiento: "",
    codigo_lote: "",
    cantidad_disponible: "",
    alerta_vencimiento: false,
  });
  const [editFormError, setEditFormError] = useState(null);

  // Animaciones
  const [formAnim, setFormAnim] = useState("");
  const [modalAnim, setModalAnim] = useState("");

  // Función para cargar inventario
  const cargarInventario = async () => {
    try {
      const inventarioData = await fetchInventario();
      setInventario(inventarioData);
    } catch (err) {
      setError("Error al cargar el inventario. Intenta recargar la página.");
      console.error(err);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [productosData, inventarioData] = await Promise.all([
          fetchProductos(),
          fetchInventario(),
        ]);
        setProductos(productosData);
        setInventario(inventarioData);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos. Intenta recargar la página.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    });
    setEditFormError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (
      !form.id_producto ||
      !form.fecha_vencimiento ||
      !form.codigo_lote ||
      !form.cantidad_disponible
    ) {
      setFormError("Todos los campos son obligatorios.");
      setFormAnim("animate-shake");
      setTimeout(() => setFormAnim(""), 500);
      return;
    }

    if (isNaN(Number(form.cantidad_disponible))) {
      setFormError("La cantidad debe ser un número válido.");
      setFormAnim("animate-shake");
      setTimeout(() => setFormAnim(""), 500);
      return;
    }

    setModalType("create");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  const handleEditar = (item) => {
    setItemEditando(item);
    setEditForm({
      id_producto: item.id_producto.toString(),
      fecha_vencimiento: item.fecha_vencimiento,
      codigo_lote: item.codigo_lote,
      cantidad_disponible: item.cantidad_disponible.toString(),
      alerta_vencimiento: item.alerta_vencimiento,
    });
    setModalType("edit");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  const handleEliminar = (item) => {
    setItemEditando(item);
    setModalType("delete");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError(null);

    if (
      !editForm.id_producto ||
      !editForm.fecha_vencimiento ||
      !editForm.codigo_lote ||
      !editForm.cantidad_disponible
    ) {
      setEditFormError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const inventarioActualizado = {
        id_producto: Number(editForm.id_producto),
        fecha_vencimiento: editForm.fecha_vencimiento,
        codigo_lote: editForm.codigo_lote,
        cantidad_disponible: Number(editForm.cantidad_disponible),
        alerta_vencimiento: editForm.alerta_vencimiento,
      };

      await actualizarInventario(
        itemEditando.id_inventario,
        inventarioActualizado
      );

      await cargarInventario();

      setFormSuccess("Registro de inventario actualizado correctamente.");
      setFormAnim("animate-successPulse");
      setTimeout(() => setFormAnim(""), 800);
      setShowModal(false);
    } catch (error) {
      setEditFormError(
        `Error al actualizar el registro. Detalle: ${error.message}`
      );
    }
  };

  const handleConfirm = async () => {
    setModalAnim("animate-fadeOutScale");
    setTimeout(async () => {
      setShowModal(false);
      try {
        if (modalType === "create") {
          if (
            !form.id_producto ||
            !form.fecha_vencimiento ||
            !form.codigo_lote ||
            !form.cantidad_disponible
          ) {
            setFormError("Todos los campos son obligatorios.");
            setFormAnim("animate-shake");
            setTimeout(() => setFormAnim(""), 500);
            return;
          }

          if (isNaN(Number(form.cantidad_disponible))) {
            setFormError("La cantidad debe ser un número válido.");
            setFormAnim("animate-shake");
            setTimeout(() => setFormAnim(""), 500);
            return;
          }

          const nuevoInventario = {
            id_producto: Number(form.id_producto),
            fecha_vencimiento: form.fecha_vencimiento,
            codigo_lote: form.codigo_lote,
            cantidad_disponible: Number(form.cantidad_disponible),
            alerta_vencimiento: form.alerta_vencimiento,
          };

          await crearInventario(nuevoInventario);
          await cargarInventario();
          setFormSuccess("Registro de inventario creado correctamente.");
          setFormAnim("animate-successPulse");
          setTimeout(() => setFormAnim(""), 800);

          // Resetear el formulario
          setForm({
            id_producto: "",
            fecha_vencimiento: "",
            codigo_lote: "",
            cantidad_disponible: "",
            alerta_vencimiento: false,
          });
        } else if (modalType === "delete") {
          await eliminarInventario(itemEditando.id_inventario);
          await cargarInventario();
          setFormSuccess("Registro eliminado correctamente.");
          setFormAnim("animate-successPulse");
          setTimeout(() => setFormAnim(""), 800);
        }
      } catch (error) {
        setFormError(
          `Error al ${
            modalType === "delete" ? "eliminar" : "crear"
          } el registro. Detalle: ${error.message}`
        );
        setFormAnim("animate-shake");
        setTimeout(() => setFormAnim(""), 500);
      }
    }, 250);
  };

  const handleCancel = () => {
    setModalAnim("animate-fadeOutScale");
    setTimeout(() => {
      setShowModal(false);
    }, 250);
  };

  const getNombreProducto = (idProducto) => {
    const producto = productos.find((prod) => prod.id_producto === idProducto);
    return producto ? producto.nombre_producto : "Desconocido";
  };

  return (
    <div className="w-full h-full bg-[#181F2A] rounded-b-lg p-4 md:p-8">
      <h2 className="text-3xl font-handwriting text-[#A8D420] mb-6">
        Gestión de Inventario
      </h2>

      {loading ? (
        <p className="text-white">Cargando datos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className={`max-w-lg mx-auto bg-transparent border border-[#A8D420] rounded-lg p-6 flex flex-col gap-4 transition-all duration-300 ${formAnim} mb-8`}
          >
            <label className="text-[#A8D420] font-semibold">
              Producto
              <select
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                name="id_producto"
                value={form.id_producto}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un producto</option>
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
              Fecha de Vencimiento
              <input
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                type="date"
                name="fecha_vencimiento"
                value={form.fecha_vencimiento}
                onChange={handleChange}
                required
              />
            </label>

            <label className="text-[#A8D420] font-semibold">
              Código de Lote
              <input
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                type="text"
                name="codigo_lote"
                value={form.codigo_lote}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </label>

            <label className="text-[#A8D420] font-semibold">
              Cantidad Disponible
              <input
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                type="number"
                name="cantidad_disponible"
                value={form.cantidad_disponible}
                onChange={handleChange}
                required
                min="0"
              />
            </label>

            <label className="flex items-center gap-2 text-[#A8D420] font-semibold">
              Alerta de Vencimiento
              <input
                type="checkbox"
                name="alerta_vencimiento"
                checked={form.alerta_vencimiento}
                onChange={handleChange}
                className="w-4 h-4"
              />
            </label>

            {formError && <p className="text-red-500">{formError}</p>}
            {formSuccess && <p className="text-green-400">{formSuccess}</p>}
            <button
              type="submit"
              className="mt-2 bg-[#A8D420] text-[#181F2A] font-bold py-2 px-4 rounded hover:bg-[#c0e95b] transition-colors"
            >
              Guardar Registro
            </button>
          </form>

          <div className="max-w-full overflow-x-auto">
            <h3 className="text-2xl font-handwriting text-[#A8D420] mb-4">
              Registros de Inventario
            </h3>
            {inventario.length === 0 ? (
              <p className="text-white">No hay registros de inventario.</p>
            ) : (
              <table className="w-full border-collapse border border-[#A8D420] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#232B39] text-[#A8D420]">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Producto</th>
                    <th className="p-3 text-left">Vencimiento</th>
                    <th className="p-3 text-left">Lote</th>
                    <th className="p-3 text-left">Cantidad</th>
                    <th className="p-3 text-left">Alerta</th>
                    <th className="p-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((item) => (
                    <tr
                      key={item.id_inventario}
                      className="border-t border-[#A8D420] hover:bg-[#232B39]/50"
                    >
                      <td className="p-3 text-white">{item.id_inventario}</td>
                      <td className="p-3 text-white">
                        {getNombreProducto(item.id_producto)}
                      </td>
                      <td className="p-3 text-white">
                        {item.fecha_vencimiento}
                      </td>
                      <td className="p-3 text-white">{item.codigo_lote}</td>
                      <td className="p-3 text-white">
                        {item.cantidad_disponible}
                      </td>
                      <td className="p-3 text-white">
                        {item.alerta_vencimiento ? "Sí" : "No"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditar(item)}
                            className="bg-[#A8D420] text-[#181F2A] font-bold py-1 px-2 rounded text-sm hover:bg-[#c0e95b] transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(item)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181F2A]/70 animate-fadeIn">
          <div
            className={`bg-[#232B39] border border-[#A8D420] rounded-lg p-8 max-w-md w-full shadow-lg transition-all duration-300 ${modalAnim}`}
          >
            {modalType === "edit" ? (
              <>
                <h3 className="text-xl font-bold text-[#A8D420] mb-4">
                  Editar Registro
                </h3>
                <form
                  onSubmit={handleEditSubmit}
                  className="flex flex-col gap-4"
                >
                  <label className="text-[#A8D420] font-semibold">
                    Producto
                    <select
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      name="id_producto"
                      value={editForm.id_producto}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Selecciona un producto</option>
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
                    Fecha de Vencimiento
                    <input
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      type="date"
                      name="fecha_vencimiento"
                      value={editForm.fecha_vencimiento}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label className="text-[#A8D420] font-semibold">
                    Código de Lote
                    <input
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      type="text"
                      name="codigo_lote"
                      value={editForm.codigo_lote}
                      onChange={handleEditChange}
                      required
                      autoComplete="off"
                    />
                  </label>

                  <label className="text-[#A8D420] font-semibold">
                    Cantidad Disponible
                    <input
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      type="number"
                      name="cantidad_disponible"
                      value={editForm.cantidad_disponible}
                      onChange={handleEditChange}
                      required
                      min="0"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-[#A8D420] font-semibold">
                    Alerta de Vencimiento
                    <input
                      type="checkbox"
                      name="alerta_vencimiento"
                      checked={editForm.alerta_vencimiento}
                      onChange={handleEditChange}
                      className="w-4 h-4"
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
                      type="submit"
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
                    ¿Estás seguro de que deseas eliminar el registro del lote{" "}
                    <span className="font-semibold text-[#A8D420]">
                      "{itemEditando?.codigo_lote}"
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
                  Confirmar registro
                </h3>
                <div className="mb-4 text-[#fff]">
                  <p>
                    <span className="font-semibold text-[#A8D420]">
                      Producto:
                    </span>{" "}
                    {getNombreProducto(Number(form.id_producto))}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">
                      Vencimiento:
                    </span>{" "}
                    {form.fecha_vencimiento}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">Lote:</span>{" "}
                    {form.codigo_lote}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">
                      Cantidad:
                    </span>{" "}
                    {form.cantidad_disponible}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">
                      Alerta:
                    </span>{" "}
                    {form.alerta_vencimiento ? "Sí" : "No"}
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

export default RegistrosAlmacen;
