import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

const tabs = ["Facebook", "Instagram", "Tiktok", "Youtube", "Tours/Tickets"];

const releases = [
  { id: 1, title: "https://www.forbes.com/business-tips", views: "6,999,345 views" },
  { id: 2, title: "https://www.forbes.com/business-tips", views: "6,999,345 views" },
  { id: 3, title: "https://www.forbes.com/business-tips", views: "6,999,345 views" },
  { id: 4, title: "https://www.forbes.com/business-tips", views: "6,999,345 views" },
];

const ArtistProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Youtube");
  const [following, setFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full h-[45vh] bg-gradient-to-b from-secondary to-background relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
      </motion.div>

      {/* Artist info */}
      <div className="px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl text-foreground">Wizkid</h1>
            <Button
              size="sm"
              variant={following ? "secondary" : "outline"}
              onClick={() => setFollowing(!following)}
              className="rounded-full text-xs h-7 px-4 border-foreground/30 transition-transform active:scale-95"
            >
              {following ? "Following" : "Follow"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Chatroom</span>
            <MessageSquare className="w-5 h-5 text-foreground" />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Tours/Tickets") navigate("/event/wizkid-uk");
              }}
              className={`text-xs whitespace-nowrap pb-1 transition-colors ${
                activeTab === tab
                  ? "text-primary border-b border-primary"
                  : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-muted-foreground text-sm mt-4 mb-4">Newest Release Engage</p>

          <div className="space-y-3">
            {releases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 py-2"
              >
                <span className="text-muted-foreground text-sm">{index + 1}.</span>
                <div className="w-10 h-10 rounded bg-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-xs truncate">{release.title}</p>
                  <p className="text-muted-foreground text-xs">{release.views}</p>
                </div>
                <MoreVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="mt-auto sticky bottom-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between">
        <Button
          size="sm"
          variant={following ? "secondary" : "outline"}
          onClick={() => setFollowing(!following)}
          className="rounded-full text-xs h-7 px-4 border-foreground/30"
        >
          {following ? "Following" : "Follow"}
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">7.6M</span>
          <MessageSquare className="w-5 h-5 text-foreground" />
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
