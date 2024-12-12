import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL, BACKEND_PORT } from "../assets";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User",
    password: "",
    companyId: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const { role } = decoded;
      if (role !== "Admin") {
        navigate("/unauthorized");
      } else {
        fetchUsers();
        fetchCompanies();
      }
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/");
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}:${BACKEND_PORT}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}:${BACKEND_PORT}/api/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BACKEND_URL}:${BACKEND_PORT}/api/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({
        name: "",
        email: "",
        role: "User",
        password: "",
        companyId: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
    }
  };

  const handleEditUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      // Ensure password is only sent if explicitly provided
      const updatedUser = { ...selectedUser };
      if (!updatedUser.password || updatedUser.password.trim() === "") {
        delete updatedUser.password;
      }

      await axios.put(
        `${BACKEND_URL}:${BACKEND_PORT}/api/users/${userId}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const decodedToken = jwtDecode(token);
      if (decodedToken.userId === userId) {
        localStorage.removeItem("token");
        alert("Your profile has been updated. Please log in again.");
        window.location.href = "/";
        return;
      }

      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error editing user:", error);
      setError("Failed to edit user. Please try again.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BACKEND_URL}:${BACKEND_PORT}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-base-200 text-base-content rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-6">
        <h3 className="text-xl font-semibold">Create New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <select
            className="select select-bordered"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <select
            className="select select-bordered"
            value={newUser.companyId}
            onChange={(e) =>
              setNewUser({ ...newUser, companyId: e.target.value })
            }
          >
            <option value="">No Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary mt-4" onClick={handleCreateUser}>
          Create User
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.company ? user.company.name : "No Company"}</td>
                  <td className="flex space-x-2">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setSelectedUser({ ...user, password: "" })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedUser && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">Edit User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input
              type="text"
              placeholder="Name"
              className="input input-bordered"
              value={selectedUser.name}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Change Password (optional)"
              className="input input-bordered"
              value={selectedUser.password || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, password: e.target.value })
              }
            />
            <select
              className="select select-bordered"
              value={selectedUser.role}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, role: e.target.value })
              }
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            <select
              className="select select-bordered"
              value={selectedUser.companyId || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, companyId: e.target.value })
              }
            >
              <option value="">No Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={() => handleEditUser(selectedUser.id)}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
