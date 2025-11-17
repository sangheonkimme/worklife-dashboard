import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID;

let isAnalyticsInitialized = false;

export const initializeAnalytics = () => {
  if (!GA_MEASUREMENT_ID || isAnalyticsInitialized) {
    return;
  }

  ReactGA.initialize([{ trackingId: GA_MEASUREMENT_ID }]);
  isAnalyticsInitialized = true;
};

export const trackPageView = (path: string) => {
  if (!GA_MEASUREMENT_ID) {
    return;
  }

  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (event: TrackEventOptions) => {
  if (!GA_MEASUREMENT_ID) {
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
  if (!GA_MEASUREMENT_ID) {
    return;
  }

  if (label) {
    ReactGA.ga("send", "timing", category, variable, value, label);
    return;
  }

  ReactGA.ga("send", "timing", category, variable, value);
};

export const isAnalyticsEnabled = () => Boolean(GA_MEASUREMENT_ID);

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
