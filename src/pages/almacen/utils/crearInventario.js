const API_BASE_URL = "http://127.0.0.1:5000/api";

const crearInventario = async (inventario) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const inventarioParaEnviar = {
    id_producto: Number(inventario.id_producto),
    fecha_vencimiento: inventario.fecha_vencimiento,
    codigo_lote: inventario.codigo_lote,
    cantidad_disponible: Number(inventario.cantidad_disponible),
    alerta_vencimiento: inventario.alerta_vencimiento,
  };

  const response = await fetch(`${API_BASE_URL}/inventarios/`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(inventarioParaEnviar),
    redirect: "follow",
    mode: "cors",
  });

  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export default crearInventario;
