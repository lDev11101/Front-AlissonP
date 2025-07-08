import { NavLink, Outlet } from "react-router-dom";

const tabClass =
  "flex-1 text-3xl font-handwriting py-2 px-8 border border-[#A8D420] transition-colors duration-200 text-[#666666] bg-transparent rounded-t-lg text-center";
const activeTabClass = "bg-[#A8D420] text-[#fff] font-bold border-b-0";

const Usuarios = () => (
  <div className="w-full h-full flex flex-col items-center">
    <div className="w-full flex justify-center mt-8">
      <div className="flex w-full max-w-7xl">
        <NavLink
          to="registros"
          className={({ isActive }) =>
            `${tabClass} ${isActive ? activeTabClass : ""}`
          }
          end
        >
          <i className="fi fi-br-users-alt mr-2"></i>
          Usuarios
        </NavLink>
      </div>
    </div>
    <div className="w-full max-w-7xl flex-1 border border-t-0 border-[#A8D420] bg-transparent rounded-b-lg">
      <Outlet />
    </div>
  </div>
);

export default Usuarios;
