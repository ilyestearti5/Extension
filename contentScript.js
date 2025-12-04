// Content script for CleanWeb Customizer
// This runs on every page and applies hidden element rules

(function () {
  "use strict";

  let selectionMode = false;
  let overlayActive = false;
  let rulesEnabled = true;
  let hiddenHistory = []; // Track hidden elements for undo
  let temporaryHidden = []; // Track temporarily hidden elements

  // Show notification
  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `cleanweb-notification cleanweb-notification-${type}`;

    // Create icon element
    const icon = document.createElement("span");
    icon.className = "cleanweb-notification-icon";
    icon.textContent = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

    // Create message element
    const messageEl = document.createElement("span");
    messageEl.textContent = message;

    notification.appendChild(icon);
    notification.appendChild(messageEl);

    notification.style.cssText = `
      position: fixed;
      top: -100px;
      left: 20px;
      background: ${
        type === "success"
          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
          : type === "error"
          ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
      };
      color: white;
      padding: 14px 20px;
      border-radius: 12px;
      z-index: 10000000;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 280px;
      max-width: 400px;
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      opacity: 0;
      transform: translateY(-20px) scale(0.9);
    `;

    // Icon styling
    icon.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      font-size: 14px;
      font-weight: bold;
      flex-shrink: 0;
    `;

    document.body.appendChild(notification);

    // Trigger slide in animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notification.style.top = "20px";
        notification.style.opacity = "1";
        notification.style.transform = "translateY(0) scale(1)";
      });
    });

    // Slide out animation
    setTimeout(() => {
      notification.style.top = "-100px";
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-20px) scale(0.9)";
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  }

  // Apply hidden elements when page loads
  async function applyHiddenElements() {
    if (!rulesEnabled) return;

    const domain = StorageManager.getCurrentDomain();
    if (!domain) return;

    const hiddenElements = await StorageManager.getHiddenElements(domain);

    let count = 0;
    hiddenElements.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          if (el.style.display !== "none") {
            el.style.display = "none";
            el.setAttribute("data-cleanweb-hidden", "true");
            el.setAttribute("data-cleanweb-selector", selector);
            count++;
          }
        });
      } catch (e) {
        console.error("Error applying selector:", selector, e);
      }
    });

    // Update badge
    if (count > 0) {
      try {
        if (chrome.runtime?.id) {
          chrome.runtime
            .sendMessage({
              action: "updateBadge",
              domain: domain,
            })
            .catch((err) => console.warn("Failed to send message:", err));
        }
      } catch (e) {
        console.warn("Extension context error:", e);
      }
    }
  }

  // Toggle all rules on/off
  async function toggleRules() {
    rulesEnabled = !rulesEnabled;

    if (rulesEnabled) {
      await applyHiddenElements();
      showNotification("Rules enabled", "success");
    } else {
      // Show all hidden elements
      document.querySelectorAll("[data-cleanweb-hidden]").forEach((el) => {
        el.style.display = "";
        el.removeAttribute("data-cleanweb-hidden");
      });
      showNotification("Rules disabled", "info");
    }
  }

  // Undo last hidden element
  async function undoLast() {
    if (hiddenHistory.length === 0) {
      showNotification("Nothing to undo", "info");
      return;
    }

    const lastItem = hiddenHistory.pop();
    const domain = StorageManager.getCurrentDomain();

    await StorageManager.removeHiddenElement(domain, lastItem.selector);

    // Show the elements
    document
      .querySelectorAll(`[data-cleanweb-selector="${lastItem.selector}"]`)
      .forEach((el) => {
        el.style.display = "";
        el.removeAttribute("data-cleanweb-hidden");
        el.removeAttribute("data-cleanweb-selector");
      });

    showNotification(`Restored: ${lastItem.selector}`, "success");

    // Update badge
    chrome.runtime.sendMessage({
      action: "updateBadge",
      domain: domain,
    });
  }

  // Show all hidden elements temporarily
  function showAllHidden() {
    const hiddenElements = document.querySelectorAll("[data-cleanweb-hidden]");

    if (hiddenElements.length === 0) {
      showNotification("No hidden elements on this page", "info");
      return;
    }

    hiddenElements.forEach((el) => {
      el.style.outline = "3px dashed #FF6B6B";
      el.style.display = "";
      el.setAttribute("data-cleanweb-temp-visible", "true");
    });

    showNotification(
      `Showing ${hiddenElements.length} hidden elements (temporarily)`,
      "info"
    );

    // Hide them again after 5 seconds
    setTimeout(() => {
      document
        .querySelectorAll("[data-cleanweb-temp-visible]")
        .forEach((el) => {
          el.style.display = "none";
          el.style.outline = "";
          el.removeAttribute("data-cleanweb-temp-visible");
        });
    }, 5000);
  }

  // Toggle selection mode
  function toggleSelectionMode() {
    selectionMode = !selectionMode;

    if (selectionMode && !overlayActive) {
      injectSelectionOverlay();
    } else if (!selectionMode && overlayActive) {
      removeSelectionOverlay();
    }
  }

  // Inject the selection overlay script
  function injectSelectionOverlay() {
    if (overlayActive) return;

    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("selectionOverlay.js");
    script.onload = function () {
      overlayActive = true;
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Remove selection overlay
  function removeSelectionOverlay() {
    window.postMessage({ type: "CLEANWEB_DISABLE_SELECTION" }, "*");
    overlayActive = false;
  }

  // Hide elements by tag name
  async function hideElementsByTag(tagName) {
    const domain = StorageManager.getCurrentDomain();
    if (!domain) return;

    const selector = tagName.toLowerCase();
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) {
      showNotification(`No ${tagName} elements found on this page`, "info");
      return;
    }

    // Save the selector
    await StorageManager.saveHiddenElement(domain, selector);

    // Add to history for undo
    hiddenHistory.push({ selector, domain, timestamp: Date.now() });

    // Apply hiding
    elements.forEach((el) => {
      el.style.display = "none";
      el.setAttribute("data-cleanweb-hidden", "true");
      el.setAttribute("data-cleanweb-selector", selector);
    });

    showNotification(
      `Hidden ${elements.length} ${tagName} element(s)`,
      "success"
    );

    // Update badge
    try {
      if (chrome.runtime?.id) {
        chrome.runtime
          .sendMessage({
            action: "updateBadge",
            domain: domain,
          })
          .catch((err) => console.warn("Failed to send message:", err));
      }
    } catch (e) {
      console.warn("Extension context error:", e);
    }
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSelection") {
      toggleSelectionMode();
      sendResponse({ active: selectionMode });
    }

    if (request.action === "applyRules") {
      applyHiddenElements();
      sendResponse({ success: true });
    }

    if (request.action === "getSelectionStatus") {
      sendResponse({ active: selectionMode });
    }

    if (request.action === "startSelectionFromContext") {
      toggleSelectionMode();
      sendResponse({ success: true });
    }

    if (request.action === "undoLast") {
      undoLast();
      sendResponse({ success: true });
    }

    if (request.action === "showAllHidden") {
      showAllHidden();
      sendResponse({ success: true });
    }

    if (request.action === "toggleRules") {
      toggleRules();
      sendResponse({ success: true });
    }

    if (request.action === "hideByTag") {
      hideElementsByTag(request.tagName);
      sendResponse({ success: true });
    }

    return true;
  });

  // Listen for element selection from overlay
  window.addEventListener("message", async (event) => {
    if (event.source !== window) return;

    if (event.data.type === "CLEANWEB_ELEMENT_SELECTED") {
      const selector = event.data.selector;
      const elementCount = event.data.elementCount || 1;
      const domain = StorageManager.getCurrentDomain();

      if (domain && selector) {
        await StorageManager.saveHiddenElement(domain, selector);

        // Add to history for undo
        hiddenHistory.push({ selector, domain, timestamp: Date.now() });

        // Apply immediately
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            el.style.display = "none";
            el.setAttribute("data-cleanweb-hidden", "true");
            el.setAttribute("data-cleanweb-selector", selector);
          });

          showNotification(
            `Hidden ${elements.length} element(s): ${selector}`,
            "success"
          );
        } catch (e) {
          console.error("Error hiding element:", e);
          showNotification("Error hiding element", "error");
        }

        // Notify popup and update badge
        try {
          if (chrome.runtime?.id) {
            chrome.runtime
              .sendMessage({
                action: "elementHidden",
                selector: selector,
              })
              .catch((err) => console.warn("Failed to send message:", err));

            chrome.runtime
              .sendMessage({
                action: "updateBadge",
                domain: domain,
              })
              .catch((err) => console.warn("Failed to send message:", err));
          }
        } catch (e) {
          console.warn("Extension context error:", e);
        }
      }
    }
  });

  // Apply rules on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyHiddenElements);
  } else {
    applyHiddenElements();
  }

  // Observe DOM changes and reapply rules
  const observer = new MutationObserver(() => {
    applyHiddenElements();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
