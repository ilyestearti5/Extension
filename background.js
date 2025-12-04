// Background service worker for CleanWeb Customizer

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("CleanWeb Customizer installed");

  // Create context menu
  chrome.contextMenus.create({
    id: "hideElement",
    title: "Hide this element",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "hideElementPermanently",
    title: "Hide this element permanently",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "separator1",
    type: "separator",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "undoLast",
    title: "Undo last hidden element",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "showHiddenElements",
    title: "Show all hidden elements",
    contexts: ["all"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "hideElement" ||
    info.menuItemId === "hideElementPermanently"
  ) {
    chrome.tabs.sendMessage(tab.id, {
      action: "startSelectionFromContext",
      permanent: info.menuItemId === "hideElementPermanently",
    });
  } else if (info.menuItemId === "undoLast") {
    chrome.tabs.sendMessage(tab.id, { action: "undoLast" });
  } else if (info.menuItemId === "showHiddenElements") {
    chrome.tabs.sendMessage(tab.id, { action: "showAllHidden" });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      if (command === "toggle-selection") {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSelection" });
      } else if (command === "undo-last") {
        chrome.tabs.sendMessage(tabs[0].id, { action: "undoLast" });
      } else if (command === "toggle-rules") {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRules" });
      } else if (command === "hide-videos") {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "hideByTag",
          tagName: "video",
        });
      } else if (command === "hide-audios") {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "hideByTag",
          tagName: "audio",
        });
      } else if (command === "hide-images") {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "hideByTag",
          tagName: "img",
        });
      } else if (command === "hide-buttons") {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "hideByTag",
          tagName: "button",
        });
      }
    }
  });
});

// Update badge with hidden element count
async function updateBadge(tabId, domain) {
  try {
    const result = await chrome.storage.sync.get([domain]);
    const count = (result[domain] || []).length;

    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString(), tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50", tabId: tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
  } catch (e) {
    console.error("Error updating badge:", e);
  }
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHiddenElements") {
    // Fetch hidden elements for a specific domain
    chrome.storage.sync.get([request.domain], (result) => {
      sendResponse({ hiddenElements: result[request.domain] || [] });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === "saveHiddenElement") {
    // Save a hidden element for a domain
    const { domain, selector } = request;

    chrome.storage.sync.get([domain], (result) => {
      let hiddenElements = result[domain] || [];

      // Avoid duplicates
      if (!hiddenElements.includes(selector)) {
        hiddenElements.push(selector);
      }

      chrome.storage.sync.set({ [domain]: hiddenElements }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.action === "removeHiddenElement") {
    // Remove a hidden element from a domain
    const { domain, selector } = request;

    chrome.storage.sync.get([domain], (result) => {
      let hiddenElements = result[domain] || [];
      hiddenElements = hiddenElements.filter((s) => s !== selector);

      chrome.storage.sync.set({ [domain]: hiddenElements }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.action === "clearDomain") {
    // Clear all hidden elements for a domain
    chrome.storage.sync.remove([request.domain], () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "getAllRules") {
    // Get all rules for the options page
    chrome.storage.sync.get(null, (items) => {
      sendResponse({ rules: items });
    });
    return true;
  }

  if (request.action === "updateBadge") {
    // Update badge when rules change
    if (sender.tab) {
      updateBadge(sender.tab.id, request.domain);
    }
    sendResponse({ success: true });
    return true;
  }
});

// Handle tab updates to reapply hidden elements
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;

      // Update badge
      updateBadge(tabId, domain);

      // Inject content script if needed and apply rules
      chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          files: ["storage.js", "contentScript.js"],
        })
        .catch((err) => {
          console.log("Script injection skipped:", err.message);
        });
    } catch (e) {
      console.log("Invalid URL:", e.message);
    }
  }
});
