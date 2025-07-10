// fetchMovimientos.js
const API_BASE_URL = "http://127.0.0.1:5000/api";

const fetchMovimientos = async () => {
  const response = await fetch(`${API_BASE_URL}/movimientos_almacen`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export default fetchMovimientos;
