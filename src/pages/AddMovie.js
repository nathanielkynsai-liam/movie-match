const saveMovie = async () => {
  const response = await fetch("http://localhost:5000/api/movies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, genre, rating })
  });
  const movie = await response.json();
  alert("Movie Added");
  setTitle(""); setGenre(""); setRating("");
};