import React from "react";
import AsicFooter from "./asicFooter";
import AsicNavbar from "./asicNavbar";

const AsicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col w-full min-h-screen overflow-x-hidden">
      <AsicNavbar />
      {children}
      <AsicFooter />
    </div>
  );
};

export default AsicLayout;
