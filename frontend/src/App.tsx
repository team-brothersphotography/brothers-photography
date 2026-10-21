import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { RequireAuth, RequireOwner } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerLogin from "./pages/OwnerLogin";
import ForgotPassword from "./pages/ForgotPassword";

import BookingPage from "./pages/Booking";
import Profile from "./pages/customer/Profile";
import MyBookings from "./pages/customer/MyBookings";

import AdminOverview from "./pages/admin/Overview";
import BookingsManager from "./pages/admin/BookingsManager";
import SlotsManager from "./pages/admin/SlotsManager";
import ServicesManager from "./pages/admin/ServicesManager";
import GalleryManager from "./pages/admin/GalleryManager";
import SiteSettingsManager from "./pages/admin/SiteSettingsManager";
import Activity from "./pages/admin/Activity";
import ChangePassword from "./pages/admin/ChangePassword";

import { useActivityTracker } from "./hooks/useActivityTracker";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-ink px-6 text-center">
      <p className="font-display text-5xl text-gold">404</p>
      <p className="text-cream-dim">
        This page doesn't exist. It may have moved, or the link was mistyped.
      </p>
      <a href="/" className="mt-2 text-sm text-gold underline underline-offset-4">
        Back to home page
      </a>
    </div>
  );
}

function ActivityTrackerListener() {
  useActivityTracker();
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ActivityTrackerListener />
        <AuthProvider>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/owner-login" element={<OwnerLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* CUSTOMER ROUTES */}
            <Route
              path="/booking"
              element={
                <RequireAuth>
                  <BookingPage />
                </RequireAuth>
              }
            />
            <Route path="/book" element={<Navigate to="/booking" replace />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <RequireAuth>
                  <MyBookings />
                </RequireAuth>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/my-bookings" replace />} />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <RequireOwner>
                  <AdminOverview />
                </RequireOwner>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <RequireOwner>
                  <BookingsManager />
                </RequireOwner>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <RequireOwner>
                  <GalleryManager />
                </RequireOwner>
              }
            />
            <Route
              path="/admin/services"
              element={
                <RequireOwner>
                  <ServicesManager />
                </RequireOwner>
              }
            />
            <Route
              path="/admin/slots"
              element={
                <RequireOwner>
                  <SlotsManager />
                </RequireOwner>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RequireOwner>
                  <SiteSettingsManager />
                </RequireOwner>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <RequireOwner>
                  <Activity />
                </RequireOwner>
              }
            />
            <Route
              path="/admin/change-password"
              element={
                <RequireOwner>
                  <ChangePassword />
                </RequireOwner>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
