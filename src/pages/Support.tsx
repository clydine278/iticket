import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-10 shadow-xl shadow-black/5">
          <div className="flex flex-col items-center text-center gap-4">
            <MessageSquare className="w-12 h-12 text-primary" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Support</p>
              <h1 className="mt-2 text-3xl font-bold">Need help? We’re here for you.</h1>
            </div>
            <p className="max-w-xl text-muted-foreground">
              Contact our support team for account help, booking questions, challenge issues, or anything else.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-6">
              <div className="flex items-center gap-3 text-primary">
                <Phone className="w-5 h-5" />
                <h2 className="text-lg font-semibold">WhatsApp</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Send us a message on WhatsApp for fast support.</p>
              <a
                href="https://wa.me/2348146686952"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                08146686952
              </a>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-6">
              <div className="flex items-center gap-3 text-primary">
                <Mail className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Email</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Reach out via email and we’ll respond as soon as possible.</p>
              <a
                href="mailto:itedsoftwares@gmail.com"
                className="mt-6 inline-flex w-full justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                itedsoftwares@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
