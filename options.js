// Options page script for CleanWeb Customizer

let allRules = {};

// Initialize options page
async function initOptions() {
  await loadAllRules();
  renderDomains();
  updateStats();
}

// Load all rules from storage
async function loadAllRules() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, (items) => {
      allRules = items;
      resolve();
    });
  });
}

// Update statistics
function updateStats() {
  const domains = Object.keys(allRules);
  const totalRules = domains.reduce((sum, domain) => {
    return sum + (allRules[domain]?.length || 0);
  }, 0);

  document.getElementById("totalDomains").textContent = domains.length;
  document.getElementById("totalRules").textContent = totalRules;
}

// Render all domains and their rules
function renderDomains(searchTerm = "") {
  const domainsList = document.getElementById("domainsList");
  const domains = Object.keys(allRules);

  if (domains.length === 0) {
    domainsList.innerHTML = `
      <div class="empty-state-large">
        <p>No rules configured yet</p>
        <p style="font-size: 14px; margin-top: 10px;">Start using the extension on any website to create rules</p>
      </div>
    `;
    return;
  }

  domainsList.innerHTML = "";

  const searchLower = searchTerm.toLowerCase();
  let visibleCount = 0;

  domains.forEach((domain) => {
    const rules = allRules[domain] || [];
    if (rules.length === 0) return;

    // Filter by search term
    if (searchTerm) {
      const domainMatches = domain.toLowerCase().includes(searchLower);
      const ruleMatches = rules.some((rule) =>
        rule.toLowerCase().includes(searchLower)
      );

      if (!domainMatches && !ruleMatches) {
        return;
      }
    }

    const domainCard = createDomainCard(domain, rules, searchLower);
    domainsList.appendChild(domainCard);
    visibleCount++;
  });

  if (visibleCount === 0 && searchTerm) {
    domainsList.innerHTML = `
      <div class="empty-state-large">
        <p>No results found for "${searchTerm}"</p>
      </div>
    `;
  }
}

// Create domain card element with search highlighting
function createDomainCard(domain, rules, searchTerm = "") {
  const card = document.createElement("div");
  card.className = "domain-card";

  const header = document.createElement("div");
  header.className = "domain-header";

  const domainName = document.createElement("div");
  domainName.className = "domain-name";
  domainName.textContent = domain;

  const actions = document.createElement("div");
  actions.className = "domain-actions";

  const visitBtn = document.createElement("button");
  visitBtn.className = "btn btn-small";
  visitBtn.textContent = "Visit";
  visitBtn.onclick = () => visitDomain(domain);

  const clearBtn = document.createElement("button");
  clearBtn.className = "btn btn-small btn-danger";
  clearBtn.textContent = "Clear";
  clearBtn.onclick = () => clearDomain(domain);

  actions.appendChild(visitBtn);
  actions.appendChild(clearBtn);

  header.appendChild(domainName);
  header.appendChild(actions);

  const rulesGrid = document.createElement("div");
  rulesGrid.className = "rules-grid";

  rules.forEach((selector) => {
    const ruleRow = createRuleRow(domain, selector);
    rulesGrid.appendChild(ruleRow);
  });

  card.appendChild(header);
  card.appendChild(rulesGrid);

  return card;
}

// Create rule row element
function createRuleRow(domain, selector) {
  const row = document.createElement("div");
  row.className = "rule-row";

  const selectorSpan = document.createElement("span");
  selectorSpan.className = "rule-selector";
  selectorSpan.textContent = selector;
  selectorSpan.title = selector;

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-icon";
  removeBtn.innerHTML = "×";
  removeBtn.title = "Remove rule";
  removeBtn.onclick = () => removeRule(domain, selector);

  row.appendChild(selectorSpan);
  row.appendChild(removeBtn);

  return row;
}

// Visit domain
function visitDomain(domain) {
  chrome.tabs.create({ url: `https://${domain}` });
}

// Remove a specific rule
async function removeRule(domain, selector) {
  let rules = allRules[domain] || [];
  rules = rules.filter((s) => s !== selector);

  if (rules.length === 0) {
    await chrome.storage.sync.remove([domain]);
    delete allRules[domain];
  } else {
    await chrome.storage.sync.set({ [domain]: rules });
    allRules[domain] = rules;
  }

  renderDomains();
  updateStats();
}

// Clear all rules for a domain
async function clearDomain(domain) {
  if (!confirm(`Clear all rules for ${domain}?`)) {
    return;
  }

  await chrome.storage.sync.remove([domain]);
  delete allRules[domain];

  renderDomains();
  updateStats();
}

// Clear all rules
async function clearAll() {
  if (!confirm("Clear ALL rules for ALL websites? This cannot be undone.")) {
    return;
  }

  await chrome.storage.sync.clear();
  allRules = {};

  renderDomains();
  updateStats();
}

// Export rules to JSON file
function exportRules() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
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

  showNotification(`Rules exported successfully!`, "success");
}

// Import rules from JSON file
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

    // Validate format
    if (typeof importedRules !== "object") {
      throw new Error("Invalid format");
    }

    let importedCount = 0;
    let mergedCount = 0;

    // Merge with existing rules
    Object.keys(importedRules).forEach((domain) => {
      const existingRules = allRules[domain] || [];
      const newRules = importedRules[domain] || [];

      if (!Array.isArray(newRules)) return;

      const beforeCount = existingRules.length;
      // Combine and remove duplicates
      const combined = [...new Set([...existingRules, ...newRules])];
      allRules[domain] = combined;

      importedCount++;
      if (combined.length > beforeCount) {
        mergedCount += combined.length - beforeCount;
      }
    });

    // Save to storage
    await chrome.storage.sync.set(allRules);

    renderDomains();
    updateStats();

    showNotification(
      `Imported ${importedCount} domain(s) with ${mergedCount} new rule(s)!`,
      "success"
    );
  } catch (e) {
    console.error("Error importing rules:", e);
    showNotification(
      "Error importing rules. Please check the file format.",
      "error"
    );
  }

  // Reset file input
  event.target.value = "";
}

// Show notification message
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${
      type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"
    };
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Event listeners
document.getElementById("exportBtn").addEventListener("click", exportRules);
document.getElementById("importBtn").addEventListener("click", importRules);
document
  .getElementById("importFile")
  .addEventListener("change", handleFileImport);
document.getElementById("clearAllBtn").addEventListener("click", clearAll);

// Search functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  renderDomains(e.target.value);
});

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initOptions);
