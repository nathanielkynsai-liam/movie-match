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
    const newTitle = prompt("Enter new title");

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

      {movies.length === 0 ? (
        <p>No movies found.</p>
      ) : (
        movies.map((movie) => (
          <div key={movie.id}>
            <h3>{movie.title}</h3>

            <p>Genre: {movie.genre}</p>

            <p>Rating: {movie.rating}</p>

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

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Favorites;