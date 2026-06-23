import { useState } from "react";

function Favorites() {
  const [movies, setMovies] = useState(
    JSON.parse(localStorage.getItem("movies")) || []
  );

  const deleteMovie = (id) => {
    const updatedMovies =
      movies.filter((movie) => movie.id !== id);

    setMovies(updatedMovies);

    localStorage.setItem(
      "movies",
      JSON.stringify(updatedMovies)
    );
  };

  const editMovie = (id) => {
    const newTitle =
      prompt("Enter new movie title");

    if (!newTitle) return;

    const updatedMovies =
      movies.map((movie) =>
        movie.id === id
          ? { ...movie, title: newTitle }
          : movie
      );

    setMovies(updatedMovies);

    localStorage.setItem(
      "movies",
      JSON.stringify(updatedMovies)
    );
  };

  return (
    <div>
      <h1>Favorite Movies</h1>

      {movies.map((movie) => (
        <div key={movie.id}>
          <p>{movie.title}</p>

          <button
            onClick={() => editMovie(movie.id)}
          >
            Edit
          </button>

          <button
            onClick={() => deleteMovie(movie.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default Favorites;