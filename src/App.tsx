import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/frontend/Index";
import Auth from "./pages/auth/Auth";
import AdminDashboard from "./pages/admin";
import AdminPages from "./pages/admin/pages/ListPages";
import CreatePage from "./pages/admin/pages/CreatePage";
import EditPage from "./pages/admin/pages/EditPage";
import PublicPage from "./pages/PublicPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/page/:slug" element={<PublicPage />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/pages" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPages />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/pages/create" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <CreatePage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/pages/edit/:id" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <EditPage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;