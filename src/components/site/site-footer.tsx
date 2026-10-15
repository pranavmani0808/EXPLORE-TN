import { Link } from "@tanstack/react-router";
import { Compass, Mail, Phone, MapPin, Heart, Shield, FileText, Lock, Globe } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t-2 border-slate-200 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)] py-14 mt-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
          {/* Brand Info */}
          <div className="space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit" aria-label="ExploreTN Home">
              <span className="grid size-9 place-items-center rounded-xl bg-sky-500 text-white font-black shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
                <Compass className="size-5 text-white" aria-hidden />
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                Explore<span className="text-sky-500">TN</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Tamil Nadu’s curated travel and exploration intelligence platform. Discover hidden Western Ghats trails, Chola heritage temples, coastal roads, and authentic culinary landmarks.
            </p>
          </div>

            {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Explore Trails</h4>
            <div className="flex flex-col space-y-2 text-xs font-medium text-slate-700">
              <Link to="/explore" className="hover:text-sky-600 transition">Interactive Map Explorer</Link>
              <Link to="/routes" className="hover:text-sky-600 transition">Curated Ghats & Coastal Routes</Link>
              <Link to="/planner" className="hover:text-sky-600 transition">AI Route & Trip Planner</Link>
              <Link to="/community" className="hover:text-sky-600 transition">Community Travel Guides</Link>
              <Link to="/events" className="hover:text-sky-600 transition">Cultural Festivals & Meets</Link>
            </div>
          </div>

          {/* Legal & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Safety & Legal</h4>
            <div className="flex flex-col space-y-2 text-xs font-medium text-slate-700">
              <Link to="/legal/privacy" className="hover:text-sky-600 transition flex items-center gap-1.5">
                <Lock className="size-3 text-sky-600" /> Privacy Policy
              </Link>
              <Link to="/legal/terms" className="hover:text-sky-600 transition flex items-center gap-1.5">
                <FileText className="size-3 text-sky-600" /> Terms of Service
              </Link>
              <Link to="/legal/cookies" className="hover:text-sky-600 transition flex items-center gap-1.5">
                <Globe className="size-3 text-sky-600" /> Cookie Preferences
              </Link>
              <Link to="/legal/security" className="hover:text-sky-600 transition flex items-center gap-1.5">
                <Shield className="size-3 text-sky-600" /> Security & Trust
              </Link>
              <Link to="/support" className="hover:text-sky-600 transition flex items-center gap-1.5">
                <Heart className="size-3 text-sky-600" /> Traveler Support & FAQs
              </Link>
            </div>
          </div>

          {/* Clickable Direct Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Direct Contact & Helplines</h4>
            <div className="flex flex-col space-y-2 text-xs font-medium text-slate-700">
              <a
                href="mailto:support@exploretn.com"
                className="hover:text-sky-600 transition flex items-center gap-2 group"
                title="Send an email to ExploreTN support"
              >
                <Mail className="size-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
                <span className="underline decoration-slate-300 underline-offset-2">support@exploretn.com</span>
              </a>
              <a
                href="tel:18004253111"
                className="hover:text-sky-600 transition flex items-center gap-2 group"
                title="Call Tamil Nadu State Tourist Helpline"
              >
                <Phone className="size-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
                <span>TN Tourist Helpline: <strong className="text-slate-900">1800-425-3111</strong></span>
              </a>
              <a
                href="tel:1926"
                className="hover:text-sky-600 transition flex items-center gap-2 group"
                title="Call Forest Department Emergency"
              >
                <Phone className="size-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
                <span>Forest Dept Emergency: <strong className="text-slate-900">1926</strong></span>
              </a>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-normal">
                <MapPin className="size-3 text-slate-500" />
                <span>Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
          <p>© {currentYear} ExploreTN. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tamil Nadu GIS & Route Services Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
