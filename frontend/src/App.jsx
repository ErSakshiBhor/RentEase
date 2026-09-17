import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Units from "./pages/Units";
import Tenants from "./pages/Tenants";
import Agreements from "./pages/Agreements";
import Payments from "./pages/Payments";

import TenantDashboard from "./pages/TenantDashboard";
import MyProperty from "./pages/MyProperty";
import MyAgreement from "./pages/MyAgreement";
import MyPayments from "./pages/MyPayments";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ============================= */}
        {/* PUBLIC ROUTES */}
        {/* ============================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* ============================= */}
        {/* OWNER PROTECTED ROUTES */}
        {/* ============================= */}

        <Route
          element={
            <ProtectedRoute allowedRole="owner">
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/properties"
            element={<Properties />}
          />

          <Route
            path="/units"
            element={<Units />}
          />

          <Route
            path="/tenants"
            element={<Tenants />}
          />

          <Route
            path="/agreements"
            element={<Agreements />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

        </Route>


        {/* ============================= */}
        {/* TENANT PROTECTED ROUTES */}
        {/* ============================= */}

        <Route
          element={
            <ProtectedRoute allowedRole="tenant">
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/tenant-dashboard"
            element={<TenantDashboard />}
          />

          <Route
            path="/my-property"
            element={<MyProperty />}
          />

          <Route
            path="/my-agreement"
            element={<MyAgreement />}
          />

          <Route
            path="/my-payments"
            element={<MyPayments />}
          />

        </Route>


        {/* ============================= */}
        {/* UNKNOWN ROUTE */}
        {/* ============================= */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;