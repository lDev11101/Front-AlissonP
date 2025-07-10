const API_BASE_URL = "http://127.0.0.1:5000/api";

const actualizarUsuario = async (id, usuario) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: myHeaders,
    body: JSON.stringify(usuario),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export default actualizarUsuario;
