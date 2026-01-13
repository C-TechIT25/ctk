import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import Loading from "./Pages/Loading";
import Admin from "./Pages/Admin";
import Score from "./Pages/Score";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default path shows Loading page */}
        <Route path="/" element={<Loading />} />

        {/* Navigate to this when button is clicked */}
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/score" element={<Score />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

