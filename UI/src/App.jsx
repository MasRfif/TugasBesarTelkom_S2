import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

import SplashPage from "./pages/public/SplashPage";
import RolePage from "./pages/public/RolePage";
import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/public/HomePage";
import EventsPage from "./pages/public/EventsPage";
import EventDetailPage from "./pages/public/EventDetailPage";
import FaqPage from "./pages/public/FaqPage";
import MapPage from "./pages/public/MapPage";
import ProfilePage from "./pages/user/ProfilePage";
import CheckoutPage from "./pages/user/CheckoutPage";
import InvoicePage from "./pages/user/InvoicePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/role" element={<RolePage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/:ticketId"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice/:id"
              element={
                <ProtectedRoute>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN_BG", "ADMIN_SYSTEM"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer"
              element={
                <ProtectedRoute
                  roles={[
                    "PENYELENGGARA",
                    "TICKET_ADMIN",
                    "PAYMENT_ADMIN",
                    "TRAFFIC_ADMIN",
                    "CONTENT_ADMIN",
                    "VIEWER",
                  ]}
                >
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
