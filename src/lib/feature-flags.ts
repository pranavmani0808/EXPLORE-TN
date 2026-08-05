export interface FeatureFlags {
  enableAITripPlanner: boolean;
  enablePassportBadges: boolean;
  enableLiveWeatherRadar: boolean;
  enableSearchV2Trigram: boolean;
  enableCommunityFeed: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableAITripPlanner: true,
  enablePassportBadges: false,
  enableLiveWeatherRadar: true,
  enableSearchV2Trigram: true,
  enableCommunityFeed: true,
};

export function getFeatureFlag(flag: keyof FeatureFlags): boolean {
  if (typeof window !== "undefined") {
    const override = localStorage.getItem(`ff_${flag}`);
    if (override !== null) return override === "true";
  }
  return DEFAULT_FEATURE_FLAGS[flag] ?? false;
}

export function setFeatureFlagOverride(flag: keyof FeatureFlags, enabled: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`ff_${flag}`, String(enabled));
  }
}
