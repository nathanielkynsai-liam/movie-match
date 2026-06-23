const login = async () => {
  const res = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) alert("Logged In Successfully");
  else alert(data.message);
};