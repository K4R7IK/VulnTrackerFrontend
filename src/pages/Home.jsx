import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; 
import axios from "axios";
import { BACKEND_URL, BACKEND_PORT } from "../assets";
import { useNavigate } from "react-router-dom"; 
import Dashboard from "../components/Dashboard";
import { Link } from "react-router-dom";

const Home = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
    email: "",
    companyId: "",
  });
  const [companyName, setCompanyName] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check if token has expired
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (decoded.exp < currentTime) {
          console.warn("Token has expired. Logging out...");
          handleLogout();
          return;
        }

        setUserInfo({
          name: decoded.name || "Unknown User",
          role: decoded.role || "Unknown Role",
          email: decoded.email || "Unknown Email",
          companyId: decoded.companyId || null,
        });
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout(); // Log out user if token is invalid
      }
    } else {
      navigate("/login"); // Redirect to login if no token is found
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch company details if companyId exists
    if (userInfo.companyId && token) {
      axios
        .get(
          `${BACKEND_URL}:${BACKEND_PORT}/api/companies/${userInfo.companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((response) => {
          setCompanyName(response.data.name || "Unknown Company");
        })
        .catch((error) => {
          console.error("Error fetching company details:", error);
          setCompanyName("Unknown Company");
        });
    }
  }, [userInfo.companyId]);

  const handleLogout = () => {
    // Clear local storage and redirect to login
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen flex-col w-full overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="px-2 flex justify-between items-center bg-base-300 text-base-content">
        <div className="text-xl font-bold">Dashboard</div>
        {userInfo.role.toLowerCase() === "admin" && (
          <Link to="/upload">
            <div className="btn btn-secondary btn-sm">Upload</div>
          </Link>
        )}
        <div className="dropdown dropdown-hover">
          <div tabIndex={0} role="button" className="btn m-1 btn-sm">
            {userInfo.name}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow -right-10"
          >
            <li>{userInfo.email}</li>
            <li>{userInfo.role}</li>
            <li>
              <button
                className="btn btn-error btn-sm mt-2"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="bg-base-100 overflow-x-none h-screen flex items-start justify-center p-4">
        <Dashboard />
      </main>
    </div>
  );
};

export default Home;
