// crearVenta.js
const API_BASE_URL = "http://127.0.0.1:5000/api";

const crearVenta = async (venta) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  try {
    const response = await fetch(`${API_BASE_URL}/ventas/`, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(venta),
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Intenta obtener el ID de diferentes formas según la estructura de respuesta
    const idVenta =
      data.id_venta || data.id || data.insertId || data.lastInsertRowid;

    if (!idVenta) {
      // Si no encontramos el ID en la respuesta, pero la venta se creó correctamente,
      // podemos hacer una segunda petición para obtener la última venta creada
      const ultimasVentas = await fetch(`${API_BASE_URL}/ventas`);
      if (ultimasVentas.ok) {
        const ventas = await ultimasVentas.json();
        if (ventas.length > 0) {
          return ventas[0]; // Asumimos que la última es la recién creada
        }
      }
      throw new Error("No se pudo determinar el ID de la venta creada");
    }

    return { ...data, id_venta: idVenta };
  } catch (error) {
    console.error("Error en crearVenta:", error);
    throw error;
  }
};

export default crearVenta;
