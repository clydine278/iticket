import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search, Ticket, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const EVENTS_PER_PAGE = 6;

const BrowseEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // The element we will watch to trigger the next load
  const observerTarget = useRef<HTMLDivElement>(null);

  // 1. Fetch Events Logic (Handles both initial load and pagination)
  const fetchEvents = async (pageNumber: number, search = searchTerm) => {
    try {
      if (pageNumber === 0) setLoading(true);
      else setFetchingMore(true);

      const from = pageNumber * EVENTS_PER_PAGE;
      const to = from + EVENTS_PER_PAGE - 1;

      let query = supabase
        .from("events")
        .select("*", { count: "exact" })
        .order("date", { ascending: true }) // Show upcoming events first
        .range(from, to);

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      if (data) {
        setEvents((prev) => (pageNumber === 0 ? data : [...prev, ...data]));
        
        // Check if there are more events in the database than what we currently have
        if (count !== null) {
          setHasMore(from + data.length < count);
        } else {
          setHasMore(data.length === EVENTS_PER_PAGE);
        }
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  // 2. Initial Load & Search Trigger
  useEffect(() => {
    // Reset to page 0 whenever the search term changes
    setPage(0);
    setHasMore(true);
    
    // Add a small debounce so it doesn't spam the DB while typing
    const delayDebounceFn = setTimeout(() => {
      fetchEvents(0, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 3. Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // If the target is visible, and we aren't currently loading, and there are more to load
        if (entries[0].isIntersecting && hasMore && !loading && !fetchingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchEvents(nextPage);
        }
      },
      { threshold: 1.0 } // Trigger when the target is 100% visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, fetchingMore, page, searchTerm]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Discover Events</h1>
            <p className="text-muted-foreground mt-1">Find and book tickets to the best experiences.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>
        </div>

        {/* Initial Loading State */}
        {loading && page === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-muted/20 h-80 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
            <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No events found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm ? `No results matching "${searchTerm}"` : "Check back later for new events."}
            </p>
          </div>
        ) : (
          /* Event Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index % 6 * 0.05 }} // Staggered animation per batch
              >
              <Card 
                  className="overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full flex flex-col"
                  // 👇 UPDATE THIS LINE: Change the URL to match your EventCheckout route
                  onClick={() => navigate(`/dashboard/event/${event.id}`)}
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {event.banner_url ? (
                      <img
                        src={event.banner_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Ticket className="w-8 h-8 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-background/90 backdrop-blur text-foreground border-none shadow-sm">
                        {event.category || "General"}
                      </Badge>
                    </div>
                  </div>

                  {/* Event Details */}
                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mt-auto mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary/70 shrink-0" />
                        <span className="truncate">
                          {format(new Date(event.date), "MMM d, yyyy · h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                        <span className="truncate">
                          {event.venue}{event.city ? `, ${event.city}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:underline underline-offset-4">
                        Get Tickets <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* 4. The Infinite Scroll Trigger Element */}
        <div 
          ref={observerTarget} 
          className="w-full py-8 flex justify-center items-center"
        >
          {fetchingMore && (
            <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading more events...
            </div>
          )}
          {!hasMore && events.length > 0 && (
            <p className="text-sm text-muted-foreground">You've reached the end!</p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default BrowseEvents;