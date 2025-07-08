const API_BASE_URL = "http://127.0.0.1:5000/api";

const actualizarProducto = async (id, producto) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
    method: "PUT",
    headers: myHeaders,
    body: JSON.stringify(producto),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(await response.text());
  const updatedProduct = await response.json();
  return {
    ...updatedProduct,
    id_categoria: Number(updatedProduct.id_categoria),
    precio_base: Number(updatedProduct.precio_base),
  };
};

export default actualizarProducto;
