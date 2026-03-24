import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
import MyTickets from "./pages/dashboard/MyTickets";
import OrderHistory from "./pages/dashboard/OrderHistory";
import Transactions from "./pages/dashboard/Transactions";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import CreateEvent from "./pages/dashboard/CreateEvent";
import EditEvent from "./pages/dashboard/EditEvent";
import MyEvents from "./pages/dashboard/MyEvents";
import CreateChallenge from "./pages/dashboard/CreateChallenge";
import MyChallenges from "./pages/dashboard/MyChallenges";
import MyBookings from "./pages/dashboard/MyBookings";
import BrowseEvents from "./pages/dashboard/BrowseEvents";
import BrowseChallenges from "./pages/dashboard/BrowseChallenges";
import EventCheckout from "./pages/dashboard/EventCheckout";
import HireArtist from "./pages/dashboard/HireArtist";
import Analytics from "./pages/dashboard/Analytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Partnerships from "./pages/Partnerships";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
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
              <Route path="/dashboard/tickets" element={<MyTickets />} />
              <Route path="/dashboard/orders" element={<OrderHistory />} />
              <Route path="/dashboard/transactions" element={<Transactions />} />
              <Route path="/dashboard/profile" element={<ProfileSettings />} />
              <Route path="/dashboard/settings" element={<ProfileSettings />} />
              <Route path="/dashboard/create-event" element={<CreateEvent />} />
              <Route path="/dashboard/events" element={<MyEvents />} />
              <Route path="/dashboard/edit-event/:id" element={<EditEvent />} />
              <Route path="/dashboard/create-challenge" element={<CreateChallenge />} />
              <Route path="/dashboard/challenges" element={<MyChallenges />} />
              <Route path="/dashboard/bookings" element={<MyBookings />} />
              <Route path="/dashboard/browse-events" element={<BrowseEvents />} />
              <Route path="/dashboard/browse-challenges" element={<BrowseChallenges />} />
              <Route path="/dashboard/event/:id" element={<EventCheckout />} />
              <Route path="/dashboard/hire-artist" element={<HireArtist />} />
              <Route path="/dashboard/earnings" element={<Dashboard />} />
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/dashboard/favorites" element={<Dashboard />} />
              <Route path="/dashboard/sales" element={<Dashboard />} />
              <Route path="/dashboard/revenue" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
