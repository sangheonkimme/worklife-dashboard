import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  initializeAnalytics,
  isAnalyticsEnabled,
  trackPageView,
} from "@/lib/analytics";

export function AnalyticsProvider() {
  const location = useLocation();

  useEffect(() => {
    initializeAnalytics();
  }, []);

  useEffect(() => {
    if (!isAnalyticsEnabled()) {
      return;
    }

    const path = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(path);
  }, [location]);

  return null;
}
