import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardStudents from "./pages/DashboardStudents";
import DashboardEnrollments from "./pages/DashboardEnrollments";
import DashboardPayments from "./pages/DashboardPayments";
import DashboardStudentEnrollment from "./pages/DashboardStudentEnrollment";
import DashboardStudentPayments from "./pages/DashboardStudentPayments";
import DashboardStudentDetails from "./pages/DashboardStudentDetails";
import DashboardTuition from "./pages/DashboardTuition";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Admin Routes */}
            <Route path="/dashboard/students" element={<DashboardStudents />} />
            <Route path="/dashboard/enrollments" element={<DashboardEnrollments />} />
            <Route path="/dashboard/payments" element={<DashboardPayments />} />
            <Route path="/dashboard/tuition" element={<DashboardTuition />} />
            <Route path="/dashboard/students/:id" element={<DashboardStudentDetails />} />
            {/* Student Routes */}
            <Route path="/dashboard/enrollment" element={<DashboardStudentEnrollment />} />
            <Route path="/dashboard/my-payments" element={<DashboardStudentPayments />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
