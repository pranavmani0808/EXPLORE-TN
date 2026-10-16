"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoreHorizontal, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/* --- Types --- */
export interface CarouselCard {
  id: string;
  title: string;
  value: string;
  color: string;
  icon: React.ElementType;
}

interface MinimalCarouselProps {
  cards: CarouselCard[];
  activeId?: string | null;
  onCardSelect?: (cardId: string | null) => void;
  onCopyClick?: (card: CarouselCard) => void;
  onCustomizeClick?: (card: CarouselCard) => void;
  hideExpandedCard?: boolean;
  className?: string;
  containerClassName?: string;
  gridClassName?: string;
  cardClassName?: string;
}

export const MinimalCarousel: React.FC<MinimalCarouselProps> = ({
  cards,
  activeId: controlledActiveId,
  onCardSelect,
  onCopyClick,
  onCustomizeClick,
  hideExpandedCard = false,
  className,
  containerClassName,
  gridClassName,
  cardClassName,
}) => {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  const setActiveId = (id: string | null) => {
    if (controlledActiveId === undefined) {
      setInternalActiveId(id);
    }
    onCardSelect?.(id);
  };

  const activeCard = cards.find((c) => c.id === activeId);
  const secondaryCards = hideExpandedCard ? cards : cards.filter((c) => c.id !== activeId);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setActiveId(null);
  };

  return (
    <div className={cn("min-h-full w-full flex items-center justify-center bg-transparent", className)}>
      <div
        className={cn("w-full flex flex-col items-center justify-center px-2 select-none font-sans", containerClassName)}
        onClick={handleBackgroundClick}
      >
        {/* Container  */}
        <div className="w-full">
          <motion.div layout className="flex flex-col gap-3">

            {/* Expanded Card */}
            <AnimatePresence mode="popLayout">
              {activeCard && !hideExpandedCard && (
                <motion.div
                  key={activeCard.id}
                  layoutId={activeCard.id}
                  className={`relative flex w-full flex-col justify-between
                             rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 text-white shadow-2xl
                             ${activeCard.color}
                             min-h-42.5 sm:h-48`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full shrink-0">
                      <activeCard.icon size={38} className="sm:w-11 sm:h-11" />
                    </div>

                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyClick?.(activeCard);
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-white/10
                                 px-3 py-1.5 sm:px-4 sm:py-2 font-bold backdrop-blur-md 
                                 text-xs sm:text-base whitespace-nowrap
                                 hover:bg-white/20 transition-colors"
                    >
                      Copy <span className="hidden xs:inline">Address</span> <Copy size={16} />
                    </motion.button>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="overflow-hidden mr-2">
                      <h3 className="text-xl sm:text-2xl font-semibold opacity-90 leading-tight truncate">
                        {activeCard.title}
                      </h3>
                      <p className="text-lg sm:text-xl font-semibold tracking-tight opacity-60 truncate">
                        {activeCard.value}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCustomizeClick?.(activeCard);
                      }}
                      className="rounded-full bg-white/30 px-3 py-1 sm:px-4 sm:py-1.5
                                 text-sm sm:text-base font-bold backdrop-blur-md 
                                 hover:bg-white/40 transition-colors shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid Layout */}
            <motion.div
              layout
              className={cn(
                "grid gap-2 sm:gap-2.5 transition-all duration-500",
                gridClassName || (activeId && !hideExpandedCard ? "grid-cols-3" : "grid-cols-2")
              )}
            >
              {(activeId && !hideExpandedCard ? secondaryCards : cards).map((card) => {
                const isSelected = activeId === card.id;
                return (
                  <motion.div
                    key={card.id}
                    layoutId={card.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId(isSelected && !hideExpandedCard ? null : card.id);
                    }}
                    whileHover={{ scale: isSelected ? 1.06 : 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    animate={{
                      scale: isSelected ? 1.05 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                      "relative flex flex-col justify-between cursor-pointer rounded-[22px] sm:rounded-[28px] p-3 sm:p-4 text-white shadow-lg transition-shadow duration-300",
                      card.color,
                      isSelected
                        ? "ring-4 ring-sky-300 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-2xl z-10"
                        : "hover:brightness-105 hover:shadow-xl",
                      cardClassName || (activeId && !hideExpandedCard ? "h-24 sm:h-28" : "h-28 sm:h-32")
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <card.icon size={activeId && !hideExpandedCard ? 20 : 28} className="shrink-0" />
                      <div className="rounded-full bg-white/10 p-1 sm:p-1.5 transition-colors">
                        <MoreHorizontal size={16} />
                      </div>
                    </div>

                    <div className="mt-1 overflow-hidden">
                      <h4 className={`${activeId && !hideExpandedCard ? "text-[10px] sm:text-xs" : "text-sm sm:text-base"} 
                                     font-medium opacity-90 truncate leading-tight`}>
                        {card.title}
                      </h4>
                      <p className={`${activeId && !hideExpandedCard ? "text-[10px] sm:text-xs" : "text-sm sm:text-base"} 
                                     font-semibold text-white/60 truncate`}>
                        {card.value}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
