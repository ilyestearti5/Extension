// Common element templates for CleanWeb Customizer

const CommonTemplates = {
  "cookie-banners": {
    name: "Cookie Banners",
    description: "Hide cookie consent banners",
    selectors: [
      "[class*='cookie-banner']",
      "[class*='cookie-consent']",
      "[id*='cookie-notice']",
      "[class*='gdpr-banner']",
      ".cc-window",
      "#cookieConsent",
      ".cookie-notice",
      "[class*='cookie-policy']",
    ],
  },

  "newsletter-popups": {
    name: "Newsletter Popups",
    description: "Hide newsletter subscription popups",
    selectors: [
      "[class*='newsletter-popup']",
      "[class*='subscribe-modal']",
      "[class*='email-signup']",
      "[id*='newsletter-modal']",
      ".newsletter-overlay",
      "[class*='popup-newsletter']",
    ],
  },

  "social-widgets": {
    name: "Social Media Widgets",
    description: "Hide social media follow/share buttons",
    selectors: [
      "[class*='social-share']",
      "[class*='share-buttons']",
      ".social-media-buttons",
      "[class*='follow-us']",
      ".social-links",
      "[class*='social-icons']",
    ],
  },

  "video-autoplay": {
    name: "Autoplay Videos",
    description: "Hide autoplay video elements",
    selectors: [
      "video[autoplay]",
      "[class*='video-player'][autoplay]",
      "[class*='autoplay-video']",
    ],
  },

  comments: {
    name: "Comments Sections",
    description: "Hide comment sections",
    selectors: [
      "#comments",
      ".comments-section",
      "[class*='comment-section']",
      "[id*='disqus']",
      ".comment-area",
      "[class*='comments-container']",
    ],
  },

  "chat-widgets": {
    name: "Chat Widgets",
    description: "Hide live chat/support widgets",
    selectors: [
      "[class*='chat-widget']",
      "[class*='live-chat']",
      "[id*='intercom']",
      "[class*='support-chat']",
      ".chat-bubble",
      "[class*='drift-']",
      "[class*='crisp-']",
    ],
  },

  "notification-bars": {
    name: "Notification Bars",
    description: "Hide top/bottom notification bars",
    selectors: [
      "[class*='notification-bar']",
      "[class*='promo-bar']",
      "[class*='announcement-banner']",
      ".top-banner",
      "[class*='sticky-banner']",
    ],
  },

  "sidebar-ads": {
    name: "Sidebar Ads",
    description: "Hide sidebar advertisements",
    selectors: [
      "[class*='sidebar-ad']",
      "[class*='ad-sidebar']",
      ".advertisement-sidebar",
      "[id*='sidebar-ads']",
    ],
  },

  "related-posts": {
    name: "Related Posts",
    description: "Hide related/recommended articles",
    selectors: [
      "[class*='related-posts']",
      "[class*='recommended-articles']",
      ".related-content",
      "[class*='you-may-like']",
    ],
  },

  "feedback-buttons": {
    name: "Feedback Buttons",
    description: "Hide feedback/survey buttons",
    selectors: [
      "[class*='feedback-button']",
      "[class*='survey-']",
      "[class*='feedback-widget']",
      ".feedback-tab",
    ],
  },
};

// Make available globally
if (typeof window !== "undefined") {
  window.CommonTemplates = CommonTemplates;
}
