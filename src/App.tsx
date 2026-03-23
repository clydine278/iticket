import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthEmail from "./pages/AuthEmail";
import AuthPhone from "./pages/AuthPhone";
import AuthOTP from "./pages/AuthOTP";
import SignupForm from "./pages/SignupForm";
import Categories from "./pages/Categories";
import CelebrityProfile from "./pages/CelebrityProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/email" element={<AuthEmail />} />
          <Route path="/auth/phone" element={<AuthPhone />} />
          <Route path="/auth/otp" element={<AuthOTP />} />
          <Route path="/signup/form" element={<SignupForm />} />
          <Route path="/onboarding/categories" element={<Categories />} />
          <Route path="/celebrity/:name" element={<CelebrityProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
