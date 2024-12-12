import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL, BACKEND_PORT } from "../assets";

export default function UploadPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [file, setFile] = useState(null);
  const [quarter, setQuarter] = useState("");
  const [isAddingNewCompany, setIsAddingNewCompany] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BACKEND_URL}:${BACKEND_PORT}/api/companies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to fetch companies. Please try again.");
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanyChange = (e) => {
    const value = e.target.value;
    if (value === "new") {
      setIsAddingNewCompany(true);
      setSelectedCompany("");
    } else {
      setIsAddingNewCompany(false);
      setSelectedCompany(value);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "text/csv") {
      alert("Please upload a valid CSV file.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || (!selectedCompany && !newCompanyName) || !quarter) {
      alert("Please fill out all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("quarter", quarter);

    if (isAddingNewCompany && newCompanyName) {
      formData.append("companyName", newCompanyName);
    } else {
      formData.append("companyName", selectedCompany);
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      await axios.post(`${BACKEND_URL}:${BACKEND_PORT}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("File uploaded and processed successfully.");
      // Reset the form
      setSelectedCompany("");
      setNewCompanyName("");
      setFile(null);
      setQuarter("");
      setIsAddingNewCompany(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Error uploading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-base-200 text-base-content rounded-lg shadow-xl mt-20">
      <h2 className="text-2xl font-bold mb-6">Upload Vulnerability Data</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Company Selection */}
        <label className="block font-semibold mb-2">
          Select or Add Company
        </label>
        <select
          value={selectedCompany || (isAddingNewCompany ? "new" : "")}
          onChange={handleCompanyChange}
          className="select select-bordered w-full"
          disabled={loading}
        >
          <option value="" disabled>
            -- Select Company --
          </option>
          {companies.map((company) => (
            <option key={company.id} value={company.name}>
              {company.name}
            </option>
          ))}
          <option value="new">+ Add New Company</option>
        </select>

        {/* New Company Name Input */}
        {isAddingNewCompany && (
          <input
            type="text"
            placeholder="Enter new company name"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            className="input input-bordered w-full max-w-xs mt-4"
            disabled={loading}
          />
        )}

        {/* Quarter Input */}
        <label className="block font-semibold mt-6">Quarter</label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., Q1"
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          disabled={loading}
        />

        {/* File Input */}
        <label className="block font-semibold mt-6">Select CSV File</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full"
          disabled={loading}
        />

        {/* Submit Button */}
        <div className="mt-4 w-full">
          <button
            type="submit"
            className={`btn btn-primary hover:btn-active w-full ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </form>
    </div>
  );
}
