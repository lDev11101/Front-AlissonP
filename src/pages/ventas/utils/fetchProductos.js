// fetchProductos.js
const API_BASE_URL = "http://127.0.0.1:5000/api";

const fetchProductos = async () => {
  const response = await fetch(`${API_BASE_URL}/productos`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.map((producto) => ({
    ...producto,
    id_categoria: Number(producto.id_categoria),
    precio_base: Number(producto.precio_base),
  }));
};

export default fetchProductos;
