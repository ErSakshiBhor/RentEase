import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const ProtectedLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default ProtectedLayout;