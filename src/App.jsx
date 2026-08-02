import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TestimonialsSection from "./components/TestimonialsSection";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";
import ScrollToTop from "./components/ScrollToTop";
import ToastViewport from "./components/ToastViewport";
import RakhiSeason from "./components/RakhiTheme";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Occasion from "./pages/Occasion";
import Relation from "./pages/Relation";
import NewArrivals from "./pages/NewArrivals";
import CategoriesPage from "./pages/CategoriesPage";
import Search from "./pages/Search";

const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-white">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-[oklch(88%_0.05_340)] border-t-[oklch(45%_0.08_340)]"
        aria-label="Loading"
      />
    </div>
  );
}

function PublicLayout() {
  return (
    <>
      <RakhiSeason />
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Home />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:slug" element={<CategoriesPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/relation" element={<Relation />} />
          <Route path="/relation/:slug" element={<Relation />} />
          <Route path="/occasion" element={<Occasion />} />
          <Route path="/occasion/:slug" element={<Occasion />} />
          <Route path="/new" element={<NewArrivals />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
      <TestimonialsSection />
      <Footer />
      <ChatBot />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <ToastViewport />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/*" element={<PublicLayout />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
