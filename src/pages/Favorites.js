const [movies, setMovies] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/movies")
    .then(res => res.json())
    .then(data => setMovies(data));
}, []);

const deleteMovie = async (id) => {
  await fetch(`http://localhost:5000/api/movies/${id}`, { method: "DELETE" });
  setMovies(movies.filter(m => m._id !== id));
};