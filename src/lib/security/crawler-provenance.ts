import crypto from "node:crypto";
import { DataProvenance } from "./types";

const provenanceStore = new Map<string, DataProvenance>();

/**
 * Register crawled external tourism data provenance
 */
export function registerCrawledDataProvenance(params: {
  sourceUrl: string;
  rawContent: string;
  trustScore?: number;
}): DataProvenance {
  const sourceHash = crypto.createHash("sha256").update(params.sourceUrl, "utf8").digest("hex");
  const rawContentHash = crypto.createHash("sha256").update(params.rawContent, "utf8").digest("hex");

  const id = `prov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const provenance: DataProvenance = {
    id,
    sourceUrl: params.sourceUrl,
    sourceHash,
    fetchedAt: new Date().toISOString(),
    approvalStatus: "PENDING",
    trustScore: params.trustScore ?? 85,
    rawContentHash,
  };

  provenanceStore.set(id, provenance);
  return provenance;
}

/**
 * Moderate & approve crawled data before merging into production database
 */
export function approveCrawledData(
  provenanceId: string,
  approvedByAdmin: string
): DataProvenance | null {
  const prov = provenanceStore.get(provenanceId);
  if (!prov) return null;

  prov.approvalStatus = "APPROVED";
  prov.approvedBy = approvedByAdmin;
  provenanceStore.set(provenanceId, prov);

  return prov;
}

/**
 * Reject crawled data
 */
export function rejectCrawledData(provenanceId: string): DataProvenance | null {
  const prov = provenanceStore.get(provenanceId);
  if (!prov) return null;

  prov.approvalStatus = "REJECTED";
  provenanceStore.set(provenanceId, prov);

  return prov;
}

/**
 * List pending provenance records for admin review
 */
export function listPendingProvenanceRecords(): DataProvenance[] {
  return Array.from(provenanceStore.values()).filter((p) => p.approvalStatus === "PENDING");
}
