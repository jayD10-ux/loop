import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AddPrototype from "./pages/AddPrototype";
import PrototypeView from "./pages/PrototypeView";
import PrototypeUpload from "./pages/PrototypeUpload";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import CommunityExplore from "./pages/CommunityExplore";
import CommunityPrototypeView from "./pages/CommunityPrototypeView";
import CommunitySubmit from "./pages/CommunitySubmit";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Community routes - publicly accessible */}
        <Route path="/community" element={<CommunityExplore />} />
        <Route path="/community/prototype/:id" element={<CommunityPrototypeView />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add-prototype" element={<ProtectedRoute><AddPrototype /></ProtectedRoute>} />
        <Route path="/prototype/:id" element={<ProtectedRoute><PrototypeView /></ProtectedRoute>} />
        <Route path="/upload-prototype" element={<ProtectedRoute><PrototypeUpload /></ProtectedRoute>} />
        <Route path="/community/submit" element={<ProtectedRoute><CommunitySubmit /></ProtectedRoute>} />
        
        {/* Redirect onboarding to dashboard */}
        <Route path="/onboarding" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        `}
      </style>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
