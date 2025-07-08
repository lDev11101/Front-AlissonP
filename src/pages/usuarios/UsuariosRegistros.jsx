import React, { useEffect, useState } from "react";
import fetchUsuarios from "./utils/fetchUsuarios";
import eliminarUsuario from "./utils/eliminarUsuario";
import fetchRoles from "./utils/fetchRoles";
import UsuarioForm from "./UsuarioForm";
import RolForm from "./RolForm";

const UsuariosRegistros = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState({ open: false, usuario: null });
  const [modalRol, setModalRol] = useState(false);

  const cargarDatos = async () => {
    setUsuarios(await fetchUsuarios());
    setRoles(await fetchRoles());
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEliminar = async (id) => {
    if (window.confirm("¿Eliminar usuario?")) {
      await eliminarUsuario(id);
      cargarDatos();
    }
  };

  return (
    <div className="w-full h-full bg-[#181F2A] rounded-b-lg p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-handwriting text-[#A8D420] font-bold">
          Usuarios del sistema
        </h2>
        <button
          className="bg-[#A8D420] text-[#181F2A] font-bold px-4 py-2 rounded hover:bg-[#c0e95b] transition-colors w-full md:w-auto"
          onClick={() => setModal({ open: true, usuario: null })}
        >
          Nuevo usuario
        </button>
        <button
          className="bg-[#A8D420] text-[#181F2A] font-bold px-4 py-2 rounded hover:bg-[#c0e95b] transition-colors w-full md:w-auto"
          onClick={() => setModalRol(true)}
        >
          Nuevo rol
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full border-collapse border border-[#A8D420] rounded-lg overflow-hidden bg-[#232B39]">
          <thead>
            <tr className="bg-[#232B39] text-[#A8D420]">
              <th className="p-3 text-center">Nombre</th>
              <th className="p-3 text-center">Correo</th>
              <th className="p-3 text-center">Rol</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                className="border-t border-[#A8D420] hover:bg-[#181F2A]/60"
              >
                <td className="p-3 text-white break-all">{u.nombre}</td>
                <td className="p-3 text-white break-all">{u.correo}</td>
                <td className="p-3 text-white">
                  {roles.find((r) => r.id_rol === u.id_rol)?.nombre_rol ||
                    "Sin rol"}
                </td>
                <td className="p-3">
                  <div className="flex flex-col justify-center items-center md:flex-row gap-2">
                    <button
                      className="bg-[#A8D420] text-[#181F2A] font-bold py-1 px-3 rounded text-sm hover:bg-[#c0e95b] transition-colors"
                      onClick={() => setModal({ open: true, usuario: u })}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 text-white font-bold py-1 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                      onClick={() => handleEliminar(u.id_usuario)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-white">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {modal.open && (
        <UsuarioForm
          usuario={modal.usuario}
          roles={roles}
          onClose={() => setModal({ open: false, usuario: null })}
          onSuccess={cargarDatos}
        />
      )}
      {modalRol && (
        <RolForm onClose={() => setModalRol(false)} onSuccess={cargarDatos} />
      )}
    </div>
  );
};

export default UsuariosRegistros;
