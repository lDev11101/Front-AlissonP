import React, { useState } from "react";
import crearUsuario from "./utils/crearUsuario";
import actualizarUsuario from "./utils/actualizarUsuario";

const UsuarioForm = ({ usuario, roles, onClose, onSuccess }) => {
  const [form, setForm] = useState(
    usuario
      ? { ...usuario, contraseña: "" }
      : {
          nombre: "",
          correo: "",
          id_rol: roles[0]?.id_rol || "",
          contraseña: "",
        }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "id_rol" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (usuario) {
        await actualizarUsuario(usuario.id_usuario, form);
      } else {
        await crearUsuario(form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        className="bg-[#232B39] p-6 rounded shadow-md w-full max-w-md border border-[#A8D420]"
        onSubmit={handleSubmit}
      >
        <h3 className="text-2xl font-handwriting font-bold mb-6 text-[#A8D420] text-center">
          {usuario ? "Editar usuario" : "Nuevo usuario"}
        </h3>
        <div className="mb-4">
          <label className="block mb-1 text-[#A8D420] font-semibold">
            Nombre
          </label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border border-[#A8D420] bg-[#181F2A] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#A8D420]"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-[#A8D420] font-semibold">
            Correo
          </label>
          <input
            name="correo"
            type="email"
            value={form.correo}
            onChange={handleChange}
            className="w-full border border-[#A8D420] bg-[#181F2A] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#A8D420]"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-[#A8D420] font-semibold">Rol</label>
          <select
            name="id_rol"
            value={form.id_rol}
            onChange={handleChange}
            className="w-full border border-[#A8D420] bg-[#181F2A] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#A8D420]"
            required
          >
            {roles.map((r) => (
              <option key={r.id_rol} value={r.id_rol}>
                {r.nombre_rol}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-[#A8D420] font-semibold">
            Contraseña
          </label>
          <input
            name="contraseña"
            type="password"
            value={form.contraseña}
            onChange={handleChange}
            className="w-full border border-[#A8D420] bg-[#181F2A] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#A8D420]"
            required
            placeholder="Ingresa la contraseña"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#A8D420] text-[#181F2A] font-bold hover:bg-[#c0e95b] transition-colors"
            disabled={loading}
          >
            {usuario ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsuarioForm;
