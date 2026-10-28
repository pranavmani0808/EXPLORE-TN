import React, { useState } from "react";
import { ChevronDown, ExternalLink, ShieldCheck, HelpCircle, Calendar, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is ExploreTN and how does it help travelers?",
    answer:
      "ExploreTN is a free, map-first discovery platform that helps travelers discover authentic heritage temples, scenic Western Ghats trails, secret waterfalls, and local food corridors across all 38 districts of Tamil Nadu. It automates trip planning with realistic driving durations, elevation changes, and fuel calculations.",
  },
  {
    question: "How are the places and trail coordinates verified?",
    answer:
      "Every destination, trail coordinate, parking facility, and entry fee is cross-verified using official Tamil Nadu Tourism Development Corporation (TTDC) data, Archaeological Survey of India (ASI) records, and trusted on-ground contributor reports.",
  },
  {
    question: "What is the best time of year to visit Tamil Nadu?",
    answer:
      "The prime season runs from October to March when coastal and plains weather is pleasant. Western Ghat hill retreats like Ooty and Kodaikanal are refreshing year-round, while Courtallam waterfalls peak during the Southwest monsoon (July to September).",
  },
  {
    question: "How does the smart itinerary planner calculate travel times?",
    answer:
      "The planner analyzes real state and national highway geometry, mountain ghat road speed constraints (such as hairpin curves in Valparai and Kolli Hills), and optimal daylight exploration windows to build safe, realistic day-by-day schedules.",
  },
  {
    question: "Are forest permits or entry tickets required for ghat trails?",
    answer:
      "Certain restricted eco-sensitive forest zones and trekking peaks (such as Grass Hills in Valparai or Kurangani in Theni) mandate online transit permits from the Tamil Nadu Forest Department before arrival. ExploreTN highlights permit notices directly on place detail cards.",
  },
  {
    question: "What are the UNESCO World Heritage monuments in Tamil Nadu?",
    answer:
      "Tamil Nadu hosts multiple UNESCO World Heritage sites including the Great Living Chola Temples (Brihadisvara in Thanjavur, Gangaikonda Cholapuram, and Airavatesvara in Darasuram), the Group of Monuments at Mahabalipuram, and the historic Nilgiri Mountain Railway.",
  },
];

export function AeoFaqAuthoritySection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Editorial Quotation / Voice of Authority */}
      <div className="mb-12 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50/70 via-white to-blue-50/40 p-6 sm:p-8 shadow-sm">
        <blockquote
          cite="https://www.tamilnadutourism.tn.gov.in"
          className="border-l-4 border-sky-500 pl-4 sm:pl-6 text-slate-700 italic text-sm sm:text-base leading-relaxed"
        >
          <p className="font-serif">
            “Tamil Nadu is home to over 33,000 ancient temples, dramatic biodiversity throughout the Western Ghats, and one of the longest contiguous coastlines in South Asia. Verified geographic mapping helps preserve cultural integrity while guiding responsible explorers beyond standard commercial circuits.”
          </p>
          <footer className="mt-3 text-xs not-italic font-sans font-bold text-sky-800 flex items-center gap-2">
            <span>— Tamil Nadu Heritage & Eco-Tourism Perspective</span>
            <span>•</span>
            <a
              href="https://en.wikipedia.org/wiki/Tourism_in_Tamil_Nadu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-600 hover:underline"
            >
              Learn more on Wikipedia <ExternalLink className="size-3" />
            </a>
          </footer>
        </blockquote>
      </div>

      {/* Structured Comparison Table */}
      <div className="mb-12">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-bold text-sky-700">
            <Sparkles className="size-3.5 text-sky-600" /> Regional Comparison Matrix
          </span>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Tamil Nadu Trail Zones & Travel Highlights
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Quick reference guide comparing terrains, peak seasons, and signature highlights.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-sky-100 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-sky-100 bg-sky-50/60 text-slate-800 font-bold">
                <th className="p-3.5 sm:p-4">Geographic Zone</th>
                <th className="p-3.5 sm:p-4">Terrain Type</th>
                <th className="p-3.5 sm:p-4">Best Travel Window</th>
                <th className="p-3.5 sm:p-4">Signature Highlights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/60 transition">
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900">Western Ghats</td>
                <td className="p-3.5 sm:p-4">Cloud forests, tea valleys & hairpin ghats</td>
                <td className="p-3.5 sm:p-4">September – May</td>
                <td className="p-3.5 sm:p-4">Ooty, Kodaikanal, Valparai, Meghamalai</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900">Coromandel Coast</td>
                <td className="p-3.5 sm:p-4">Coastal highways, dunes & rock temples</td>
                <td className="p-3.5 sm:p-4">November – March</td>
                <td className="p-3.5 sm:p-4">Mahabalipuram, Pondicherry, Pitchavaram, Rameshwaram</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900">Cauvery Delta & Heritage Basin</td>
                <td className="p-3.5 sm:p-4">Alluvial plains, sacred river ghats & stone mandapams</td>
                <td className="p-3.5 sm:p-4">October – March</td>
                <td className="p-3.5 sm:p-4">Thanjavur Big Temple, Madurai Meenakshi, Kumbakonam</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900">Southern Cape & Western Pass</td>
                <td className="p-3.5 sm:p-4">Tricontinental ocean confluence & forest streams</td>
                <td className="p-3.5 sm:p-4">July – February</td>
                <td className="p-3.5 sm:p-4">Kanyakumari, Courtallam Falls, Kalakkad Mundanthurai</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Structured FAQ Section */}
      <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-10 shadow-xl">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-bold text-sky-700">
            <HelpCircle className="size-3.5 text-sky-600" /> Frequently Asked Questions
          </span>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Frequently Asked Questions About Traveling in Tamil Nadu
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Direct, fact-checked answers to assist travelers and itinerary planning.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 transition hover:border-sky-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm sm:text-base"
                >
                  <h3 className="font-display text-sm sm:text-base text-slate-900 font-bold m-0 p-0">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`size-4 shrink-0 text-sky-600 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* E-E-A-T Transparency Disclosure and Last Updated Timestamp */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Editorial Disclosure:</strong> Written with AI assistance and independently verified by local Tamil Nadu explorers and official state tourism resources. No paid affiliate placements.
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 font-mono text-slate-600">
            <Calendar className="size-3.5 text-sky-600" />
            <span>Last updated:</span>
            <time dateTime="2026-10-28" className="font-bold text-slate-800">
              October 2026
            </time>
          </div>
        </div>
      </div>
    </section>
  );
}
