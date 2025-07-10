// fetchVentas.js
const API_BASE_URL = "http://127.0.0.1:5000/api";
const fetchVentas = async () => {
  const response = await fetch(`${API_BASE_URL}/ventas`, {
    method: "GET",
    redirect: "follow",
  });

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();

  const ventasConDetalles = await Promise.all(
    data.map(async (venta) => {
      const detallesResponse = await fetch(
        `${API_BASE_URL}/ventas/${venta.id_venta}/detalle`
      );
      if (!detallesResponse.ok) throw new Error(await detallesResponse.text());

      const detalles = await detallesResponse.json();
      return {
        ...venta,
        total: Number(venta.total), // Convertir a número
        detalles: detalles.map((d) => ({
          ...d,
          precio_unitario: Number(d.precio_unitario), // También convertir precios
        })),
      };
    })
  );

  return ventasConDetalles;
};
export default fetchVentas;
