import React from "react";
import AsicFooter from "./asicFooter";
import AsicNavbar from "./asicNavbar";

const AsicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <AsicNavbar />
      <div className="flex flex-col w-full min-h-screen overflow-x-hidden">
        {children}
      </div>
      <AsicFooter />
    </>
  );
};

export default AsicLayout;
