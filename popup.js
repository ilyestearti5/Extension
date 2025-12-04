// Popup script for CleanWeb Customizer

let currentDomain = "";
let selectionActive = false;

// Initialize popup
async function initPopup() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.url) {
      showError("Cannot access this page");
      return;
    }

    const url = new URL(tab.url);
    currentDomain = url.hostname;

    // Update UI
    document.getElementById("currentDomain").textContent = currentDomain;

    // Load rules for this domain
    loadRules();

    // Check if selection mode is active
    chrome.tabs.sendMessage(
      tab.id,
      { action: "getSelectionStatus" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log("Content script not ready");
          return;
        }
        if (response && response.active) {
          selectionActive = true;
          updateSelectionButton();
        }
      }
    );
  } catch (e) {
    console.error("Error initializing popup:", e);
    showError("Error loading extension");
  }
}

// Load rules for current domain
async function loadRules() {
  try {
    const result = await chrome.storage.sync.get([currentDomain]);
    const rules = result[currentDomain] || [];

    document.getElementById("hiddenCount").textContent = rules.length;

    const rulesList = document.getElementById("rulesList");
    rulesList.innerHTML = "";

    if (rules.length === 0) {
      rulesList.innerHTML = '<p class="empty-state">No hidden elements yet</p>';
    } else {
      rules.forEach((selector) => {
        const ruleItem = createRuleItem(selector);
        rulesList.appendChild(ruleItem);
      });
    }
  } catch (e) {
    console.error("Error loading rules:", e);
  }
}

// Create rule item element
function createRuleItem(selector) {
  const div = document.createElement("div");
  div.className = "rule-item";

  const selectorSpan = document.createElement("span");
  selectorSpan.className = "selector";
  selectorSpan.textContent = selector;
  selectorSpan.title = selector;

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "×";
  removeBtn.title = "Remove rule";
  removeBtn.onclick = () => removeRule(selector);

  div.appendChild(selectorSpan);
  div.appendChild(removeBtn);

  return div;
}

// Toggle selection mode
async function toggleSelection() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.tabs.sendMessage(
      tab.id,
      { action: "toggleSelection" },
      (response) => {
        if (chrome.runtime.lastError) {
          showError("Cannot activate on this page");
          return;
        }

        selectionActive = response.active;
        updateSelectionButton();

        if (selectionActive) {
          window.close(); // Close popup when selection starts
        }
      }
    );
  } catch (e) {
    console.error("Error toggling selection:", e);
    showError("Error starting selection");
  }
}

// Update selection button state
function updateSelectionButton() {
  const btn = document.getElementById("toggleSelectionBtn");
  const btnText = document.getElementById("btnText");

  if (selectionActive) {
    btn.classList.add("active");
    btnText.textContent = "Selection Active";
  } else {
    btn.classList.remove("active");
    btnText.textContent = "Start Selection";
  }
}

// Remove a specific rule
async function removeRule(selector) {
  try {
    const result = await chrome.storage.sync.get([currentDomain]);
    let rules = result[currentDomain] || [];
    rules = rules.filter((s) => s !== selector);

    await chrome.storage.sync.set({ [currentDomain]: rules });

    // Reload the page to show changes
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.reload(tab.id);

    // Refresh rules list
    loadRules();
  } catch (e) {
    console.error("Error removing rule:", e);
    showError("Error removing rule");
  }
}

// Clear all rules for current domain
async function clearDomain() {
  if (!confirm(`Clear all hidden elements for ${currentDomain}?`)) {
    return;
  }

  try {
    await chrome.storage.sync.remove([currentDomain]);

    // Reload the page
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.reload(tab.id);

    // Refresh rules list
    loadRules();
  } catch (e) {
    console.error("Error clearing domain:", e);
    showError("Error clearing rules");
  }
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Show error message
function showError(message) {
  const container = document.querySelector(".container");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  container.insertBefore(errorDiv, container.firstChild);

  setTimeout(() => errorDiv.remove(), 3000);
}

// Export all rules to JSON file
async function exportRules() {
  try {
    const allRules = await chrome.storage.sync.get(null);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const dataStr = JSON.stringify(allRules, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `cleanweb-rules-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess("Rules exported successfully!");
  } catch (e) {
    console.error("Error exporting rules:", e);
    showError("Error exporting rules");
  }
}

// Trigger file import
function importRules() {
  document.getElementById("importFile").click();
}

// Handle file import
async function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importedRules = JSON.parse(text);

    // Get existing rules
    const existingRules = await chrome.storage.sync.get(null);

    // Merge rules
    const mergedRules = { ...existingRules };
    Object.keys(importedRules).forEach((domain) => {
      const existing = mergedRules[domain] || [];
      const imported = importedRules[domain] || [];

      // Combine and remove duplicates
      mergedRules[domain] = [...new Set([...existing, ...imported])];
    });

    // Save merged rules
    await chrome.storage.sync.set(mergedRules);

    // Reload current domain rules
    await loadRules();

    showSuccess(`Rules imported successfully!`);
  } catch (e) {
    console.error("Error importing rules:", e);
    showError("Invalid file format");
  }

  // Reset file input
  event.target.value = "";
}

// Show success message
function showSuccess(message) {
  const container = document.querySelector(".container");
  const successDiv = document.createElement("div");
  successDiv.className = "notification success";
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 13px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;

  container.insertBefore(successDiv, container.firstChild);

  setTimeout(() => successDiv.remove(), 3000);
}

// Event listeners
document
  .getElementById("toggleSelectionBtn")
  .addEventListener("click", toggleSelection);
document
  .getElementById("clearDomainBtn")
  .addEventListener("click", clearDomain);
document.getElementById("undoBtn").addEventListener("click", undoLast);
document.getElementById("showHiddenBtn").addEventListener("click", showHidden);
document
  .getElementById("toggleRulesBtn")
  .addEventListener("click", toggleRules);
document.getElementById("exportBtn").addEventListener("click", exportRules);
document.getElementById("importBtn").addEventListener("click", importRules);
document
  .getElementById("importFile")
  .addEventListener("change", handleFileImport);
document
  .getElementById("openOptionsBtn")
  .addEventListener("click", openOptions);

// Tag hiding event listeners
document
  .getElementById("hideVideosBtn")
  .addEventListener("click", () => hideByTag("video"));
document
  .getElementById("hideAudiosBtn")
  .addEventListener("click", () => hideByTag("audio"));
document
  .getElementById("hideImagesBtn")
  .addEventListener("click", () => hideByTag("img"));
document
  .getElementById("hideIframesBtn")
  .addEventListener("click", () => hideByTag("iframe"));
document
  .getElementById("hideNavsBtn")
  .addEventListener("click", () => hideByTag("nav"));
document
  .getElementById("hideButtonsBtn")
  .addEventListener("click", () => hideByTag("button"));
document
  .getElementById("hideLinksBtn")
  .addEventListener("click", () => hideByTag("a"));
document
  .getElementById("hideCustomTagBtn")
  .addEventListener("click", hideCustomTag);

// Handle Enter key in custom tag input
document.getElementById("customTagInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    hideCustomTag();
  }
});

// Hide elements by tag name
async function hideByTag(tagName) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.tabs.sendMessage(
      tab.id,
      { action: "hideByTag", tagName: tagName },
      (response) => {
        if (chrome.runtime.lastError) {
          showError("Cannot hide elements on this page");
          return;
        }
        if (response && response.success) {
          setTimeout(() => loadRules(), 300);
        }
      }
    );
  } catch (e) {
    console.error("Error hiding by tag:", e);
    showError("Error hiding elements");
  }
}

// Hide custom tag
async function hideCustomTag() {
  const input = document.getElementById("customTagInput");
  const tagName = input.value.trim().toLowerCase();

  if (!tagName) {
    showError("Please enter a tag name");
    return;
  }

  // Validate tag name
  if (!/^[a-z][a-z0-9-]*$/i.test(tagName)) {
    showError("Invalid tag name");
    return;
  }

  await hideByTag(tagName);
  input.value = "";
}

// Undo last hidden element
async function undoLast() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, { action: "undoLast" }, () => {
      setTimeout(() => loadRules(), 300);
    });
  } catch (e) {
    console.error("Error undoing:", e);
  }
}

// Show hidden elements temporarily
async function showHidden() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, { action: "showAllHidden" });
  } catch (e) {
    console.error("Error showing hidden:", e);
  }
}

// Toggle rules on/off
async function toggleRules() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, { action: "toggleRules" });
  } catch (e) {
    console.error("Error toggling rules:", e);
  }
}

// Listen for element hidden events
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "elementHidden") {
    loadRules(); // Refresh the list
  }
});

// Initialize when popup opens
document.addEventListener("DOMContentLoaded", initPopup);
