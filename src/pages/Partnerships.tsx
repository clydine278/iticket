import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Partnerships = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
      setPartners(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-8">
        <div className="mb-6">
          <p className="text-primary text-[10px] font-medium">Our Partners</p>
          <h1 className="font-display text-2xl font-bold">Partnerships</h1>
          <p className="text-muted-foreground text-sm mt-1">We collaborate with amazing brands and organizations to bring you the best experiences.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No partners yet. Stay tuned!</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {partners.map((partner) => (
              <motion.div key={partner.id} variants={fadeUp}>
                <a
                  href={partner.website_url || "#"}
                  target={partner.website_url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="block border border-border rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-primary/50"
                >
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.name} className="h-16 w-16 mx-auto object-contain mb-3 rounded-lg" />
                  ) : (
                    <div className="h-16 w-16 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-lg text-primary">
                        {partner.name?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h3 className="font-bold text-sm">{partner.name}</h3>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Partnerships;
