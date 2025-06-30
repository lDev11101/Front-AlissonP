import { NavLink } from "react-router-dom";

const SidebarItem = ({ item }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `flex items-center gap-2 px-4 py-2 rounded transition-colors
      ${
        isActive
          ? "bg-[#A8D420] text-[#181F2A] font-bold"
          : "text-[#A8D420] hover:bg-[#232B39] hover:text-white"
      }`
    }
  >
    <span>
      <i className={`${item.icon}`}></i>
    </span>
    <span>{item.label}</span>
  </NavLink>
);

export default SidebarItem;
