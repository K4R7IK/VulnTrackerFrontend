import React, { useState } from "react";
import axios from "axios";
import BgImg from "../assets/Sand 1.jpg";
import { BACKEND_PORT, BACKEND_URL } from "../assets";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}:${BACKEND_PORT}/api/auth/login`,
        {
          email,
          password,
        },
      );

      // Save the token to localStorage
      localStorage.setItem("token", response.data.token);

      // Redirect to the home page
      window.location.href = "/home";
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `url(${BgImg})`,
      }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-neutral-content">
        <div className="max-w-md">
          <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl text-base-content">
            <h1 className="text-center text-2xl mt-3 font-bold">
              Tracker Login
            </h1>
            <form className="card-body" onSubmit={handleLogin}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input input-bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="input input-bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover">
                    Forgot password?
                  </a>
                </label>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center mb-3">
                  {error}
                </div>
              )}
              <div className="form-control mt-6">
                <button
                  className={`btn btn-primary ${loading ? "loading" : ""}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
