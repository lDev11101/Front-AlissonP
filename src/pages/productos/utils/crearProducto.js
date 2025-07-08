const API_BASE_URL = "http://127.0.0.1:5000/api";

const crearProducto = async (producto) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const productoParaEnviar = {
    id_categoria: Number(producto.id_categoria),
    nombre_producto: producto.nombre_producto.trim(),
    precio_base: Number(producto.precio_base),
  };
  const response = await fetch(`${API_BASE_URL}/productos/`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(productoParaEnviar),
    redirect: "follow",
    mode: "cors",
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export default crearProducto;
