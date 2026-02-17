import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardStudents from "./pages/DashboardStudents";
import DashboardEnrollments from "./pages/DashboardEnrollments";
import DashboardPayments from "./pages/DashboardPayments";
import DashboardStudentEnrollment from "./pages/DashboardStudentEnrollment";
import DashboardStudentPayments from "./pages/DashboardStudentPayments";
import DashboardStudentDetails from "./pages/DashboardStudentDetails";
import DashboardTuition from "./pages/DashboardTuition";
import DashboardFinancialStatus from "./pages/DashboardFinancialStatus";
import DashboardTransactions from "./pages/DashboardTransactions";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Chatbot } from "./components/chat/Chatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Chatbot />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/signup" element={<Signup />} />

            {/* Dashboard Routes (Shared/Base) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/dashboard/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/enrollments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardEnrollments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/payments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tuition"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardTuition />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/financial-status"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardFinancialStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/transactions"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/students/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardStudentDetails />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/dashboard/enrollment"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardStudentEnrollment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-payments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardStudentPayments />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
