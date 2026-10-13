import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireOwner } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerLogin from "./pages/OwnerLogin";
import ForgotPassword from "./pages/ForgotPassword";
import BookingPage from "./pages/Booking";
import CustomerDashboard from "./pages/customer/Dashboard";

import AdminOverview from "./pages/admin/Overview";
import BookingsManager from "./pages/admin/BookingsManager";
import SlotsManager from "./pages/admin/SlotsManager";
import ServicesManager from "./pages/admin/ServicesManager";
import GalleryManager from "./pages/admin/GalleryManager";
import SiteSettingsManager from "./pages/admin/SiteSettingsManager";
import ChangePassword from "./pages/admin/ChangePassword";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-ink px-6 text-center">
      <p className="font-display text-5xl text-gold">404</p>
      <p className="text-cream-dim">
        This page doesn't exist. It may have moved, or the link was mistyped.
      </p>
      <a href="/" className="mt-2 text-sm text-gold underline underline-offset-4">
        Back to the home page
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/owner-login" element={<OwnerLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/book"
            element={
              <RequireAuth>
                <BookingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <CustomerDashboard />
              </RequireAuth>
            }
          />

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
            path="/admin/slots"
            element={
              <RequireOwner>
                <SlotsManager />
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
            path="/admin/gallery"
            element={
              <RequireOwner>
                <GalleryManager />
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
  );
}
