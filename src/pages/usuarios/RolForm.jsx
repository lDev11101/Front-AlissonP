import React, { useState } from "react";
const API_BASE_URL = "http://127.0.0.1:5000/api";

const RolForm = ({ onClose, onSuccess }) => {
  const [nombre_rol, setNombreRol] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roles/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_rol }),
      });
      if (!response.ok) throw new Error(await response.text());
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
        className="bg-[#232B39] p-6 rounded shadow-md w-full max-w-sm border border-[#A8D420]"
        onSubmit={handleSubmit}
      >
        <h3 className="text-xl font-bold mb-4 text-[#A8D420] text-center">
          Nuevo rol
        </h3>
        <div className="mb-4">
          <label className="block mb-1 text-[#A8D420] font-semibold">
            Nombre del rol
          </label>
          <input
            value={nombre_rol}
            onChange={(e) => setNombreRol(e.target.value)}
            className="w-full border border-[#A8D420] bg-[#181F2A] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#A8D420]"
            required
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
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RolForm;
