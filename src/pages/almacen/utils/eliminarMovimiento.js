// eliminarMovimiento.js
const API_BASE_URL = "http://127.0.0.1:5000/api";

const eliminarMovimiento = async (id) => {
  const response = await fetch(`${API_BASE_URL}/movimientos_almacen/${id}`, {
    method: "DELETE",
    redirect: "follow",
  });

  if (!response.ok) throw new Error(await response.text());
  return true;
};

export default eliminarMovimiento;
