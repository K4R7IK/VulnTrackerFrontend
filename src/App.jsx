import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Home";
import UserManagement from "./pages/UserManagement";
import UploadPage from "./pages/UploadPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
