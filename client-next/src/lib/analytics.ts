import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

const canUseBrowserAnalytics = () =>
  typeof window !== "undefined" && Boolean(GA_MEASUREMENT_ID);

let isAnalyticsInitialized = false;

export const initializeAnalytics = () => {
  if (!canUseBrowserAnalytics() || isAnalyticsInitialized) {
    return;
  }

  ReactGA.initialize([{ trackingId: GA_MEASUREMENT_ID as string }]);
  isAnalyticsInitialized = true;
};

export const trackPageView = (path: string) => {
  if (!canUseBrowserAnalytics()) {
    return;
  }

  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (event: TrackEventOptions) => {
  if (!canUseBrowserAnalytics()) {
    return;
  }

  if ("name" in event) {
    ReactGA.event(event.name, event.params);
    return;
  }

  ReactGA.event({
    category: event.category,
    action: event.action,
    label: event.label,
    value: event.value,
    nonInteraction: event.nonInteraction,
  });
};

export const trackTiming = ({
  category,
  variable,
  value,
  label,
}: TrackTimingOptions) => {
  if (!canUseBrowserAnalytics()) {
    return;
  }

  if (label) {
    ReactGA.ga("send", "timing", category, variable, value, label);
    return;
  }

  ReactGA.ga("send", "timing", category, variable, value);
};

export const isAnalyticsEnabled = () =>
  Boolean(GA_MEASUREMENT_ID) && typeof window !== "undefined";

type NamedEventOptions = {
  name: string;
  params?: Record<string, unknown>;
};

type CategorizedEventOptions = {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
};

type TrackEventOptions = NamedEventOptions | CategorizedEventOptions;

type TrackTimingOptions = {
  category: string;
  variable: string;
  value: number;
  label?: string;
};
