// fetchTiposMovimiento.js
const API_BASE_URL = "http://127.0.0.1:5000/api";

const fetchTiposMovimiento = async () => {
  const response = await fetch(`${API_BASE_URL}/tipos_movimiento`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export default fetchTiposMovimiento;
