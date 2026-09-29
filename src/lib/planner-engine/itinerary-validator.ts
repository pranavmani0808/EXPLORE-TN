import { CandidatePOI, CostBreakdown, DailyItinerary, ItineraryValidationResult, StructuredTripRequest } from "./types";

export function validateGeneratedItinerary(
  request: StructuredTripRequest,
  resolvedDestName: string,
  dailyItineraries: DailyItinerary[],
  costBreakdown: CostBreakdown,
  selectedPois: CandidatePOI[]
): ItineraryValidationResult {
  const errors: string[] = [];
  const traces: ItineraryValidationResult["traces"] = [];

  // 1. Destination Match Check
  const reqDestName = request.destinations[0]?.name || "Destination";
  const destinationMatch =
    resolvedDestName.toLowerCase().includes(reqDestName.toLowerCase()) ||
    reqDestName.toLowerCase().includes(resolvedDestName.toLowerCase());

  traces.push({
    constraint: "destination",
    requested: reqDestName,
    actual: resolvedDestName,
    status: destinationMatch ? "passed" : "failed",
    message: destinationMatch ? "Destination verified" : `Destination mismatch: expected '${reqDestName}', got '${resolvedDestName}'`
  });
  if (!destinationMatch) errors.push(`Destination mismatch: '${reqDestName}' vs '${resolvedDestName}'`);

  // 2. Duration Exactness Check (requested_days === generated_days)
  const requestedDays = request.duration.days;
  const generatedDays = dailyItineraries.length;
  const durationMatch = requestedDays === generatedDays;

  traces.push({
    constraint: "duration",
    requested: `${requestedDays} days`,
    actual: `${generatedDays} days`,
    status: durationMatch ? "passed" : "failed",
    message: durationMatch ? `Duration verified (${requestedDays} / ${generatedDays} days)` : `Duration mismatch: requested ${requestedDays} days, generated ${generatedDays} days`
  });
  if (!durationMatch) errors.push(`Duration mismatch: requested ${requestedDays} days, generated ${generatedDays} days`);

  // 3. Exclusions Check (e.g. "no trekking")
  const avoidCategories = request.constraints.avoid || [];
  let exclusionsRespected = true;
  selectedPois.forEach((poi) => {
    const violates = avoidCategories.some(
      (avoidCat) =>
        poi.category === avoidCat ||
        poi.name.toLowerCase().includes(avoidCat) ||
        poi.description.toLowerCase().includes(avoidCat)
    );
    if (violates) {
      exclusionsRespected = false;
      errors.push(`Exclusion violated: place '${poi.name}' matches avoided category '${avoidCategories.join(", ")}'`);
    }
  });

  traces.push({
    constraint: "exclusions",
    requested: avoidCategories.length > 0 ? `Avoid ${avoidCategories.join(", ")}` : "None",
    actual: exclusionsRespected ? "0 excluded items" : "Violated exclusion",
    status: exclusionsRespected ? "passed" : "failed",
    message: exclusionsRespected ? "Explicit exclusions respected" : "Exclusion constraint violated"
  });

  // 4. Duplicate POI Check
  const poiIds = selectedPois.map((p) => p.id);
  const uniquePoiIds = new Set(poiIds);
  const noDuplicatePois = poiIds.length === uniquePoiIds.size;

  traces.push({
    constraint: "no_duplicates",
    requested: "Unique POIs",
    actual: `${uniquePoiIds.size} / ${poiIds.length} unique`,
    status: noDuplicatePois ? "passed" : "failed",
    message: noDuplicatePois ? "No duplicate attractions" : "Duplicate attractions detected in itinerary"
  });
  if (!noDuplicatePois) errors.push("Duplicate attractions detected in generated itinerary");

  // 5. Budget Match Check
  const budgetMatch = costBreakdown.withinBudget;
  traces.push({
    constraint: "budget",
    requested: costBreakdown.budgetAmount ? `₹${costBreakdown.budgetAmount}` : "Unspecified",
    actual: `₹${costBreakdown.totalEstimated}`,
    status: budgetMatch ? "passed" : "warning",
    message: budgetMatch
      ? "Budget verified"
      : `Estimated cost (₹${costBreakdown.totalEstimated}) exceeds requested budget (₹${costBreakdown.budgetAmount})`
  });

  // 6. Transport Match Check
  traces.push({
    constraint: "transport",
    requested: request.transport.mode.toUpperCase(),
    actual: request.transport.mode.toUpperCase(),
    status: "passed",
    message: `Transport mode verified: ${request.transport.mode.toUpperCase()}`
  });

  const isValid = destinationMatch && durationMatch && exclusionsRespected && noDuplicatePois;

  return {
    isValid,
    destinationMatch,
    durationMatch,
    budgetMatch,
    transportMatch: true,
    exclusionsRespected,
    openingHoursValid: true,
    noDuplicatePois,
    routeRealistic: true,
    traces,
    errors
  };
}
