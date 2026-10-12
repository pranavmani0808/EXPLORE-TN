"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoreHorizontal, Copy } from "lucide-react";

/* --- Types --- */
export interface CarouselCard {
  id: string;
  title: string;
  value: string;
  color?: string;
  icon?: React.ElementType;
  image?: string;
  route?: string;
  tagline?: string;
  actionLabel?: string;
}

interface MinimalCarouselProps {
  cards: CarouselCard[];
  onCardClick?: (card: CarouselCard) => void;
  onActionClick?: (card: CarouselCard) => void;
}

export const MinimalCarousel: React.FC<MinimalCarouselProps> = ({
  cards,
  onCardClick,
  onActionClick,
}) => {
  const [activeId, setActiveId] = useState<string | null>(cards[0]?.id || null);

  const activeCard = cards.find((c) => c.id === activeId) || cards[0];
  const secondaryCards = cards.filter((c) => c.id !== activeCard?.id);

  return (
    <div className="w-full select-none font-sans">
      <motion.div layout className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Expanded Active Hub Card */}
        <AnimatePresence mode="popLayout">
          {activeCard && (
            <motion.div
              key={activeCard.id}
              layoutId={`minimal-carousel-${activeCard.id}`}
              className="relative flex-1 min-h-[260px] sm:min-h-[300px] overflow-hidden rounded-3xl border border-sky-200/80 bg-slate-900 shadow-xl transition-shadow flex flex-col justify-between p-6 sm:p-7 text-white"
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            >
              {/* Background Cover Image with Gradient */}
              {activeCard.image && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <motion.img
                    src={activeCard.image}
                    alt={activeCard.title}
                    className="size-full object-cover transition-transform duration-700 scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
                </div>
              )}

              {/* Top Row: Icon Badge & Explore Hub Action */}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-sm">
                  {activeCard.icon ? (
                    <activeCard.icon className="size-6 text-sky-200" />
                  ) : (
                    <span className="text-xl">📍</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sky-500/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white shadow-sm">
                    {activeCard.value}
                  </span>
                  {activeCard.route && (
                    <a
                      href={activeCard.route}
                      onClick={(e) => {
                        if (onActionClick) {
                          e.preventDefault();
                          onActionClick(activeCard);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-xs font-extrabold text-slate-900 backdrop-blur-md hover:bg-sky-50 hover:text-sky-700 transition shadow-sm"
                    >
                      <span>Explore Hub</span>
                      <MoreHorizontal className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Row: Title, Tagline and Quick Details */}
              <div className="relative z-10 mt-8 space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                  <span>Tamil Nadu Travel Hub</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white leading-tight drop-shadow-sm">
                  {activeCard.title}
                </h3>
                {activeCard.tagline && (
                  <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-lg line-clamp-2">
                    {activeCard.tagline}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secondary Hub Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 w-full lg:max-w-md xl:max-w-lg"
        >
          {secondaryCards.map((card) => (
            <motion.div
              key={card.id}
              layoutId={`minimal-carousel-${card.id}`}
              onClick={() => {
                setActiveId(card.id);
                onCardClick?.(card);
              }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              className="relative flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl border border-sky-100 bg-white p-3.5 sm:p-4 text-slate-800 shadow-sm hover:border-sky-300 hover:shadow-md transition-all duration-300 group h-32 sm:h-36"
            >
              {/* Background Preview */}
              {card.image && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="size-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                </div>
              )}

              {/* Header Icon + Indicator */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex size-8 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  {card.icon ? (
                    <card.icon className="size-4" />
                  ) : (
                    <span className="text-xs">📍</span>
                  )}
                </div>
                <div className="rounded-full bg-slate-100/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 border border-slate-200">
                  {card.value}
                </div>
              </div>

              {/* Title & Hub info */}
              <div className="relative z-10 mt-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-tight">
                  {card.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  Tap to view activities
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};