import React, { useEffect, useState } from "react";
import fetchCategorias from "./utils/fetchCategorias";
import fetchProductos from "./utils/fetchProductos";
import crearProducto from "./utils/crearProducto";
import actualizarProducto from "./utils/actualizarProducto";
import eliminarProducto from "./utils/eliminarProducto";

const Registros = () => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formulario principal
  const [form, setForm] = useState({
    id_categoria: "",
    nombre_producto: "",
    precio_base: "",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Modal y formulario de edición
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [productoEditando, setProductoEditando] = useState(null);
  const [editForm, setEditForm] = useState({
    id_categoria: "",
    nombre_producto: "",
    precio_base: "",
  });
  const [editFormError, setEditFormError] = useState(null);

  // Animaciones
  const [formAnim, setFormAnim] = useState("");
  const [modalAnim, setModalAnim] = useState("");

  // Función para cargar productos
  const cargarProductos = async () => {
    try {
      const productosData = await fetchProductos();
      setProductos(productosData);
    } catch (err) {
      setError("Error al cargar los productos. Intenta recargar la página.");
      console.error(err);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [categoriasData, productosData] = await Promise.all([
          fetchCategorias(),
          fetchProductos(),
        ]);
        setCategorias(categoriasData);
        setProductos(productosData);
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
    setEditFormError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!form.id_categoria || !form.nombre_producto || !form.precio_base) {
      setFormError("Todos los campos son obligatorios.");
      setFormAnim("animate-shake");
      setTimeout(() => setFormAnim(""), 500);
      return;
    }

    // Validación adicional para el precio
    if (isNaN(Number(form.precio_base))) {
      setFormError("El precio debe ser un número válido.");
      setFormAnim("animate-shake");
      setTimeout(() => setFormAnim(""), 500);
      return;
    }

    setModalType("create");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  const handleEditar = (producto) => {
    setProductoEditando(producto);
    setEditForm({
      id_categoria: producto.id_categoria.toString(),
      nombre_producto: producto.nombre_producto,
      precio_base: producto.precio_base.toString(),
    });
    setModalType("edit");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  const handleEliminar = (producto) => {
    setProductoEditando(producto);
    setModalType("delete");
    setShowModal(true);
    setModalAnim("animate-fadeInScale");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError(null);

    if (
      !editForm.id_categoria ||
      !editForm.nombre_producto ||
      !editForm.precio_base
    ) {
      setEditFormError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const productoActualizado = {
        id_categoria: Number(editForm.id_categoria),
        nombre_producto: editForm.nombre_producto,
        precio_base: Number(editForm.precio_base),
      };

      await actualizarProducto(
        productoEditando.id_producto,
        productoActualizado
      );

      // Actualizamos la lista de productos después de la edición
      await cargarProductos();

      setFormSuccess("Producto actualizado correctamente.");
      setFormAnim("animate-successPulse");
      setTimeout(() => setFormAnim(""), 800);
      setShowModal(false);
    } catch (error) {
      setEditFormError(
        `Error al actualizar el producto. Detalle: ${error.message}`
      );
    }
  };

  const handleConfirm = async () => {
    setModalAnim("animate-fadeOutScale");
    setTimeout(async () => {
      setShowModal(false);
      try {
        if (modalType === "create") {
          // Validación adicional antes de crear el producto
          if (
            !form.id_categoria ||
            !form.nombre_producto ||
            !form.precio_base
          ) {
            setFormError("Todos los campos son obligatorios.");
            setFormAnim("animate-shake");
            setTimeout(() => setFormAnim(""), 500);
            return;
          }

          const producto = {
            id_categoria: Number(form.id_categoria),
            nombre_producto: form.nombre_producto.trim(),
            precio_base: Number(form.precio_base),
          };

          // Validar que el precio sea un número válido
          if (isNaN(producto.precio_base)) {
            setFormError("El precio debe ser un número válido.");
            setFormAnim("animate-shake");
            setTimeout(() => setFormAnim(""), 500);
            return;
          }

          await crearProducto(producto);
          // Actualizamos la lista de productos después de crear uno nuevo
          await cargarProductos();
          setFormSuccess("Producto creado correctamente.");
          setFormAnim("animate-successPulse");
          setTimeout(() => setFormAnim(""), 800);

          // Resetear el formulario
          setForm({
            id_categoria: "",
            nombre_producto: "",
            precio_base: "",
          });
        } else if (modalType === "delete") {
          await eliminarProducto(productoEditando.id_producto);
          // Actualizamos la lista de productos después de eliminar
          await cargarProductos();
          setFormSuccess("Producto eliminado correctamente.");
          setFormAnim("animate-successPulse");
          setTimeout(() => setFormAnim(""), 800);
        }
      } catch (error) {
        setFormError(
          `Error al ${
            modalType === "delete" ? "eliminar" : "crear"
          } el producto. Detalle: ${error.message}`
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

  const getNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(
      (cat) => cat.id_categoria === idCategoria
    );
    return categoria ? categoria.nombre_categoria : "Desconocida";
  };

  return (
    <div className="w-full h-full bg-[#181F2A] rounded-b-lg p-4 md:p-8">
      <h2 className="text-3xl font-handwriting text-[#A8D420] mb-6">
        Registrar Producto
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
              Categoría
              <select
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                name="id_categoria"
                value={form.id_categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option
                    key={cat.id_categoria}
                    value={cat.id_categoria}
                    className="text-[#fff]"
                  >
                    {cat.nombre_categoria}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[#A8D420] font-semibold">
              Nombre del producto
              <input
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                type="text"
                name="nombre_producto"
                value={form.nombre_producto}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </label>
            <label className="text-[#A8D420] font-semibold">
              Precio base
              <input
                className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                type="number"
                step="0.01"
                name="precio_base"
                value={form.precio_base}
                onChange={handleChange}
                required
                min="0"
              />
            </label>
            {formError && <p className="text-red-500">{formError}</p>}
            {formSuccess && <p className="text-green-400">{formSuccess}</p>}
            <button
              type="submit"
              className="mt-2 bg-[#A8D420] text-[#181F2A] font-bold py-2 px-4 rounded hover:bg-[#c0e95b] transition-colors"
            >
              Guardar producto
            </button>
          </form>

          <div className="max-w-full overflow-x-auto">
            <h3 className="text-2xl font-handwriting text-[#A8D420] mb-4">
              Lista de Productos
            </h3>
            {productos.length === 0 ? (
              <p className="text-white">No hay productos registrados.</p>
            ) : (
              <table className="w-full border-collapse border border-[#A8D420] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#232B39] text-[#A8D420]">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Nombre</th>
                    <th className="p-3 text-left">Categoría</th>
                    <th className="p-3 text-left">Precio Base</th>
                    <th className="p-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr
                      key={producto.id_producto}
                      className="border-t border-[#A8D420] hover:bg-[#232B39]/50"
                    >
                      <td className="p-3 text-white">{producto.id_producto}</td>
                      <td className="p-3 text-white">
                        {producto.nombre_producto}
                      </td>
                      <td className="p-3 text-white">
                        {getNombreCategoria(producto.id_categoria)}
                      </td>
                      <td className="p-3 text-white">
                        ${Number(producto.precio_base).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditar(producto)}
                            className="bg-[#A8D420] text-[#181F2A] font-bold py-1 px-2 rounded text-sm hover:bg-[#c0e95b] transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(producto)}
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
                  Editar Producto
                </h3>
                <form
                  onSubmit={handleEditSubmit}
                  className="flex flex-col gap-4"
                >
                  <label className="text-[#A8D420] font-semibold">
                    Categoría
                    <select
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      name="id_categoria"
                      value={editForm.id_categoria}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option
                          key={cat.id_categoria}
                          value={cat.id_categoria}
                          className="text-[#fff]"
                        >
                          {cat.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[#A8D420] font-semibold">
                    Nombre del producto
                    <input
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      type="text"
                      name="nombre_producto"
                      value={editForm.nombre_producto}
                      onChange={handleEditChange}
                      required
                      autoComplete="off"
                    />
                  </label>
                  <label className="text-[#A8D420] font-semibold">
                    Precio base
                    <input
                      className="w-full mt-1 p-2 rounded bg-[#232B39] text-[#A8D420] border border-[#A8D420] focus:outline-none"
                      type="number"
                      step="0.01"
                      name="precio_base"
                      value={editForm.precio_base}
                      onChange={handleEditChange}
                      required
                      min="0"
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
                    ¿Estás seguro de que deseas eliminar el producto{" "}
                    <span className="font-semibold text-[#A8D420]">
                      "{productoEditando?.nombre_producto}"
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
                      Categoría:
                    </span>{" "}
                    {getNombreCategoria(Number(form.id_categoria))}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">
                      Nombre:
                    </span>{" "}
                    {form.nombre_producto}
                  </p>
                  <p>
                    <span className="font-semibold text-[#A8D420]">
                      Precio base:
                    </span>{" "}
                    ${Number(form.precio_base).toFixed(2)}
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

export default Registros;
