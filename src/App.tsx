import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BuyTickets from "./pages/BuyTickets";
import EventDetailPage from "./pages/EventDetailPage";
import Checkout from "./pages/Checkout";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import BookArtist from "./pages/BookArtist";
import ArtistDetail from "./pages/ArtistDetail";
import CreateAccount from "./pages/CreateAccount";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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
            <Route path="/" element={<Index />} />
            <Route path="/buy-tickets" element={<BuyTickets />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenge/:id" element={<ChallengeDetail />} />
            <Route path="/book-artist" element={<BookArtist />} />
            <Route path="/artist/:id" element={<ArtistDetail />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
