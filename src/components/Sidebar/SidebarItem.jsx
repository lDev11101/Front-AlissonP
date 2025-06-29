import { NavLink } from "react-router-dom";

const SidebarItem = ({ item }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded ${
        isActive ? "bg-gray-300 font-bold" : ""
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
