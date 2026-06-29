import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BoxOffice from "./pages/BoxOffice";
import Trending from "./pages/Trending";
import People from "./pages/People";

export default function App() {
  return (
    <>
      <NavBar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover/box-office" element={<BoxOffice />} />
          <Route path="/discover/trending" element={<Trending />} />
          <Route path="/discover/people" element={<People />} />
        </Routes>
      </div>
    </>
  );
}