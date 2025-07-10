const API_BASE_URL = "http://127.0.0.1:5000/api";

const fetchRoles = async () => {
  const response = await fetch(`${API_BASE_URL}/roles`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export default fetchRoles;
