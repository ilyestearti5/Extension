// Storage utility module for CleanWeb Customizer

const StorageManager = {
  // Get current domain from URL
  getCurrentDomain() {
    try {
      const url = new URL(window.location.href);
      return url.hostname;
    } catch (e) {
      console.error("Error getting domain:", e);
      return null;
    }
  },

  // Get hidden elements for current domain
  async getHiddenElements(domain) {
    return new Promise((resolve) => {
      try {
        if (!chrome.runtime?.id) {
          console.warn("Extension context invalidated");
          resolve([]);
          return;
        }
        chrome.storage.sync.get([domain], (result) => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            resolve([]);
            return;
          }
          resolve(result[domain] || []);
        });
      } catch (e) {
        console.error("Error in getHiddenElements:", e);
        resolve([]);
      }
    });
  },

  // Save a hidden element selector for a domain
  async saveHiddenElement(domain, selector) {
    return new Promise((resolve) => {
      try {
        if (!chrome.runtime?.id) {
          console.warn("Extension context invalidated");
          resolve(false);
          return;
        }
        chrome.storage.sync.get([domain], (result) => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            resolve(false);
            return;
          }
          let hiddenElements = result[domain] || [];

          if (!hiddenElements.includes(selector)) {
            hiddenElements.push(selector);
          }

          chrome.storage.sync.set({ [domain]: hiddenElements }, () => {
            if (chrome.runtime.lastError) {
              console.error("Storage error:", chrome.runtime.lastError);
              resolve(false);
              return;
            }
            resolve(true);
          });
        });
      } catch (e) {
        console.error("Error in saveHiddenElement:", e);
        resolve(false);
      }
    });
  },

  // Remove a hidden element selector from a domain
  async removeHiddenElement(domain, selector) {
    return new Promise((resolve) => {
      try {
        if (!chrome.runtime?.id) {
          console.warn("Extension context invalidated");
          resolve(false);
          return;
        }
        chrome.storage.sync.get([domain], (result) => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            resolve(false);
            return;
          }
          let hiddenElements = result[domain] || [];
          hiddenElements = hiddenElements.filter((s) => s !== selector);

          chrome.storage.sync.set({ [domain]: hiddenElements }, () => {
            if (chrome.runtime.lastError) {
              console.error("Storage error:", chrome.runtime.lastError);
              resolve(false);
              return;
            }
            resolve(true);
          });
        });
      } catch (e) {
        console.error("Error in removeHiddenElement:", e);
        resolve(false);
      }
    });
  },

  // Clear all hidden elements for a domain
  async clearDomain(domain) {
    return new Promise((resolve) => {
      try {
        if (!chrome.runtime?.id) {
          console.warn("Extension context invalidated");
          resolve(false);
          return;
        }
        chrome.storage.sync.remove([domain], () => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            resolve(false);
            return;
          }
          resolve(true);
        });
      } catch (e) {
        console.error("Error in clearDomain:", e);
        resolve(false);
      }
    });
  },

  // Get all rules across all domains
  async getAllRules() {
    return new Promise((resolve) => {
      try {
        if (!chrome.runtime?.id) {
          console.warn("Extension context invalidated");
          resolve({});
          return;
        }
        chrome.storage.sync.get(null, (items) => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            resolve({});
            return;
          }
          resolve(items);
        });
      } catch (e) {
        console.error("Error in getAllRules:", e);
        resolve({});
      }
    });
  },
};

// Make available globally
if (typeof window !== "undefined") {
  window.StorageManager = StorageManager;
}
