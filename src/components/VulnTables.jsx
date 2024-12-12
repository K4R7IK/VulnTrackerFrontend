import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correctly import jwtDecode
import { BACKEND_URL, BACKEND_PORT } from "../assets";

const VulnTables = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]); // State for vulnerabilities
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [page, setPage] = useState(1); // Pagination state
  const [totalPages, setTotalPages] = useState(0); // Total pages for pagination

  // Filters
  const [search, setSearch] = useState(""); // Search query
  const [quarters, setQuarters] = useState([]); // Available quarters
  const [selectedQuarter, setSelectedQuarter] = useState(""); // Selected quarter
  const [tab, setTab] = useState("quarter"); // Active tab (quarter/carry forward)

  const token = localStorage.getItem("token"); // Retrieve JWT token

  useEffect(() => {
    if (!token) {
      setError("Authorization token is missing.");
      return;
    }

    // Decode JWT to get the companyId
    const decode = jwtDecode(token);
    const { companyId } = decode;

    if (!companyId) {
      setError("Invalid company ID.");
      return;
    }

    fetchQuarters(companyId); // Fetch quarters for the company
  }, [token]);

  useEffect(() => {
    fetchVulnerabilities(); // Fetch vulnerabilities on filter or page change
  }, [page, search, tab, selectedQuarter]);

  // Fetch quarters based on the company ID
  const fetchQuarters = async (companyId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}:${BACKEND_PORT}/api/quarters`,
        {
          params: { companyId },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setQuarters(response.data); // Set quarters from the response
    } catch (error) {
      console.error("Error fetching quarters:", error);
      setError("Failed to load quarters.");
    }
  };

  // Fetch vulnerabilities based on filters and pagination
  const fetchVulnerabilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        search,
        companyId: jwtDecode(token).companyId, // Use companyId from token
      };

      if (tab === "carryForward") {
        params.isResolved = false; // For carry forward, fetch unresolved vulnerabilities
      } else if (tab === "quarter" && selectedQuarter) {
        params.quarter = selectedQuarter; // Filter by selected quarter
      }

      const response = await axios.get(
        `${BACKEND_URL}:${BACKEND_PORT}/api/vulnerabilities`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let vulnerabilitiesData = response.data.data;

      // Filter carry-forward vulnerabilities
      if (tab === "carryForward") {
        vulnerabilitiesData = vulnerabilitiesData.filter(
          (vuln) => vuln.quarter.length > 1,
        );
      }

      setVulnerabilities(vulnerabilitiesData);
      setTotalPages(response.data.totalPages); // Set total pages for pagination
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      setError("Failed to load vulnerabilities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="my-4 flex space-x-2">
        <input
          type="text"
          placeholder="Search vulnerabilities..."
          className="input input-bordered"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
        >
          <option value="">All Quarters</option>
          {quarters.map((quarter) => (
            <option key={quarter} value={quarter}>
              {quarter}
            </option>
          ))}
        </select>
        <div className="join">
          <button
            className={`btn btn-primary join-item ${tab === "quarter" ? "btn-active" : ""}`}
            onClick={() => setTab("quarter")}
          >
            Quarter
          </button>
          <button
            className={`btn btn-primary join-item ${tab === "carryForward" ? "btn-active" : ""}`}
            onClick={() => setTab("carryForward")}
          >
            Carry Forward
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-scroll">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="table">
            {/* Table Header */}
            <thead>
              <tr>
                <th>Title</th>
                <th>IP Address</th>
                <th>Port</th>
                <th>Risk Level</th>
                <th>Description</th>
                <th>Protocol</th>
                <th>CVE ID</th>
                <th>Impact</th>
                <th>Is Resolved</th>
                <th>Age</th>
                <th>Quarters</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.map((vuln) => (
                <tr key={vuln.id}>
                  <td className="max-w-sm truncate">{vuln.title}</td>
                  <td className="max-w-sm truncate">{vuln.assetIp}</td>
                  <td className="max-w-sm truncate">{vuln.port}</td>
                  <td className="max-w-sm truncate">{vuln.riskLevel}</td>
                  <td className="max-w-sm truncate">{vuln.description}</td>
                  <td className="max-w-sm truncate">{vuln.protocol}</td>
                  <td className="max-w-sm truncate">
                    {Array.isArray(vuln.cveId) ? vuln.cveId.join(", ") : "N/A"}
                  </td>
                  <td className="max-w-sm truncate">{vuln.impact}</td>
                  <td className="max-w-sm truncate">
                    {vuln.isResolved ? "Yes" : "No"}
                  </td>
                  <td className="max-w-sm truncate">{vuln.age}</td>
                  <td className="max-w-sm truncate">
                    {Array.isArray(vuln.quarter)
                      ? vuln.quarter.join(", ")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="btn btn-outline"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <div>
          Page {page} of {totalPages}
        </div>
        <button
          className="btn btn-outline"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VulnTables;
