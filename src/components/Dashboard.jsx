import React from "react";
import VulnTables from "./VulnTables";

const Dashboard = () => {
  return (
    <div className="container">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-4 shadow rounded">Table or Chart 1</div>
        <div className="bg-white p-4 shadow rounded">Table or Chart 2</div>
      </div>
      <div className="w-full">
        <VulnTables />
      </div>
    </div>
  );
};

export default Dashboard;
