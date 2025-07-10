const API_BASE_URL = "http://127.0.0.1:5000/api";

const fetchInventario = async () => {
  const response = await fetch(`${API_BASE_URL}/inventarios`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.map((item) => ({
    ...item,
    id_producto: Number(item.id_producto),
    cantidad_disponible: Number(item.cantidad_disponible),
    alerta_vencimiento: Boolean(item.alerta_vencimiento),
  }));
};

export default fetchInventario;
