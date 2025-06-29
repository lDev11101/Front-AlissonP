import React, { useState } from "react";
import SidebarItem from "./SidebarItem";
import { menuItems } from "./menuItems";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa solo en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? (
          // Icono X
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Icono hamburguesa
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 w-64 bg-gray-100 shadow-md p-4 z-40
          h-full md:h-screen
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
      >
        <h2 className="text-xl font-semibold mb-6 mt-10 md:mt-0">Menú</h2>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </nav>
      </aside>

      {/* Fondo claro y opaco al abrir menú en móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-white bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
