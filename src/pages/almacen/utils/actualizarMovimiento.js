// actualizarMovimiento.js
const API_BASE_URL = "http://127.0.0.1:5000/api";

const actualizarMovimiento = async (id, movimiento) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}/movimientos_almacen/${id}`, {
    method: "PUT",
    headers: myHeaders,
    body: JSON.stringify(movimiento),
    redirect: "follow",
  });

  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export default actualizarMovimiento;
