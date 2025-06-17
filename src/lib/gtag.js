export const GA_TRACKING_ID = 'G-HV84PVFRBD';

export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};