import { useState } from "react";

function AddMovie() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");

  const saveMovie = () => {
    const movies =
      JSON.parse(localStorage.getItem("movies")) || [];

    movies.push({
      id: Date.now(),
      title,
      genre,
      rating
    });

    localStorage.setItem(
      "movies",
      JSON.stringify(movies)
    );

    alert("Movie Added");

    setTitle("");
    setGenre("");
    setRating("");
  };

  return (
    <div>
      <h1>Add Movie</h1>

      <input
        type="text"
        placeholder="Movie Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Rating"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />

      <br /><br />

      <button onClick={saveMovie}>
        Save Movie
      </button>
    </div>
  );
}

export default AddMovie;