import React from "react";
import AsicNavbar from "./asicNavbar";

const AsicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div className="flex flex-col w-full min-h-screen overflow-x-hidden">
        <AsicNavbar />
        <main>{children}</main>
      </div>
    </>
  );
};

export default AsicLayout;
