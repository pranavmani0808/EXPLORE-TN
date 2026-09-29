import { CandidatePOI, CostBreakdown, StructuredTripRequest } from "./types";

export function calculateTripBudget(
  totalDistanceKm: number,
  days: number,
  request: StructuredTripRequest,
  selectedPois: CandidatePOI[]
): CostBreakdown {
  const { travelers, transport, budget } = request;
  const numPeople = travelers.groupSize || 2;
  const numRooms = Math.ceil(numPeople / 2);
  const nights = Math.max(0, days - 1);

  // 1. Transport & Fuel Costs
  let transportCost = 0;
  if (transport.mode === "bike") {
    // Motorcycle: ~35 km/L @ ₹100/L
    transportCost = Math.round((totalDistanceKm / 35) * 100);
  } else if (transport.mode === "bus" || transport.mode === "train") {
    // Public transport fares: ~₹2.2 per km per person
    transportCost = Math.round(totalDistanceKm * 2.2 * numPeople);
  } else {
    // Car: ~14 km/L @ ₹100/L + Highway Tolls
    const fuel = Math.round((totalDistanceKm / 14) * 100);
    const tolls = Math.round((totalDistanceKm / 200) * 120);
    transportCost = fuel + tolls;
  }

  // 2. Accommodation Stay Costs (per night)
  let costPerRoomNight = 2200; // Standard default
  if (budget.tier === "luxury" || budget.amount && budget.amount >= 30000) {
    costPerRoomNight = 6500;
  } else if (budget.tier === "budget" || (budget.amount && budget.amount <= 4000)) {
    costPerRoomNight = 950;
  } else if (budget.tier === "free") {
    costPerRoomNight = 0;
  }

  const stayCost = Math.round(nights * numRooms * costPerRoomNight);

  // 3. Food Costs (per day per person)
  let foodPerPersonPerDay = 450;
  if (budget.tier === "luxury") foodPerPersonPerDay = 1400;
  else if (budget.tier === "budget") foodPerPersonPerDay = 250;
  else if (budget.tier === "free") foodPerPersonPerDay = 150;

  const foodCost = Math.round(days * numPeople * foodPerPersonPerDay);

  // 4. Activities & Entry Fees
  const activitiesCost = selectedPois.reduce((sum, poi) => sum + (poi.numericEntryFee * numPeople), 0);

  // 5. Parking & Misc
  const parkingTollsCost = transport.mode === "car" ? Math.round(150 + days * 50) : 50;

  // Total Calculation
  const totalEstimated = Math.max(0, transportCost + stayCost + foodCost + activitiesCost + parkingTollsCost);

  // Budget Verification
  let budgetAmount = budget.amount;
  let withinBudget = true;
  let budgetDiff = 0;

  if (budgetAmount !== undefined && !isNaN(budgetAmount)) {
    withinBudget = totalEstimated <= budgetAmount;
    budgetDiff = Math.round(budgetAmount - totalEstimated);
  }

  const assumptions = [
    `Transport (${transport.mode.toUpperCase()}): ₹${transportCost} based on ${totalDistanceKm} km round-trip`,
    `Stay (${nights} nights, ${numRooms} room/s): ₹${stayCost} @ ₹${costPerRoomNight}/night`,
    `Food (${days} days, ${numPeople} pax): ₹${foodCost} @ ₹${foodPerPersonPerDay}/day/pax`,
    `Activities & Entry: ₹${activitiesCost} total for ${selectedPois.length} spots`,
    `Parking & Tolls: ₹${parkingTollsCost}`
  ];

  return {
    transportCost,
    stayCost,
    foodCost,
    activitiesCost,
    parkingTollsCost,
    totalEstimated,
    budgetAmount,
    withinBudget,
    budgetDifference: budgetDiff,
    assumptions
  };
}
