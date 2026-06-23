import { useState } from "react";

function AddMovie() {
  const [title, setTitle] = useState("");

  const saveMovie = () => {
    const movies =
      JSON.parse(localStorage.getItem("movies")) || [];

    movies.push({
      id: Date.now(),
      title: title
    });

    localStorage.setItem(
      "movies",
      JSON.stringify(movies)
    );

    alert("Movie Added");
    setTitle("");
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

      <button onClick={saveMovie}>
        Save Movie
      </button>
    </div>
  );
}

export default AddMovie;