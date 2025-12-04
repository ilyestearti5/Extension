// Selection overlay for element picking
// This script is injected into the page context

(function () {
  "use strict";

  let isActive = false;
  let highlightedElement = null;
  let overlay = null;
  let selectedElements = []; // Track multiple selected elements (for Ctrl+click)
  let isCtrlPressed = false;

  // Create overlay element
  function createOverlay() {
    overlay = document.createElement("div");
    overlay.id = "cleanweb-selection-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999999;
      cursor: crosshair;
      pointer-events: auto;
    `;

    const tooltip = document.createElement("div");
    tooltip.id = "cleanweb-tooltip";
    tooltip.style.cssText = `
      position: fixed;
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: Arial, sans-serif;
      z-index: 1000000;
      pointer-events: none;
      display: none;
    `;
    tooltip.textContent = "Click to hide this element";

    // Selection counter
    const counter = document.createElement("div");
    counter.id = "cleanweb-selection-counter";
    counter.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-family: Arial, sans-serif;
      z-index: 1000001;
      display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);
    document.body.appendChild(counter);
  }

  // Generate CSS selector for an element
  function generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className && typeof element.className === "string") {
      const classes = element.className.split(" ").filter((c) => c.trim());
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join(".")}`;
      }
    }

    // Fallback to nth-child
    const parent = element.parentElement;
    if (parent) {
      const index = Array.from(parent.children).indexOf(element) + 1;
      return `${generateSelector(
        parent
      )} > ${element.tagName.toLowerCase()}:nth-child(${index})`;
    }

    return element.tagName.toLowerCase();
  }

  // Generate multiple selector options
  function generateSelectorOptions(element) {
    const options = [];

    // Option 1: ID selector (most specific)
    if (element.id) {
      options.push({
        selector: `#${element.id}`,
        specificity: "high",
        description: "By ID",
      });
    }

    // Option 2: Class selector
    if (element.className && typeof element.className === "string") {
      const classes = element.className.split(" ").filter((c) => c.trim());
      if (classes.length > 0) {
        const classSelector = `${element.tagName.toLowerCase()}.${classes[0]}`;
        options.push({
          selector: classSelector,
          specificity: "medium",
          description: "By first class",
        });

        if (classes.length > 1) {
          const allClassSelector = `${element.tagName.toLowerCase()}.${classes.join(
            "."
          )}`;
          options.push({
            selector: allClassSelector,
            specificity: "high",
            description: "By all classes",
          });
        }
      }
    }

    // Option 3: Tag name only (broad)
    options.push({
      selector: element.tagName.toLowerCase(),
      specificity: "low",
      description: "All similar tags",
    });

    // Option 4: Parent > child
    if (element.parentElement) {
      const parent = element.parentElement;
      const index = Array.from(parent.children).indexOf(element) + 1;
      options.push({
        selector: `${parent.tagName.toLowerCase()} > ${element.tagName.toLowerCase()}:nth-child(${index})`,
        specificity: "medium",
        description: "By position",
      });
    }

    return options;
  }

  // Count elements matching selector
  function countMatches(selector) {
    try {
      return document.querySelectorAll(selector).length;
    } catch (e) {
      return 0;
    }
  }

  // Highlight element on hover
  function highlightElement(element) {
    if (highlightedElement) {
      // Don't remove outline if it's a selected element
      if (!selectedElements.some((sel) => sel.element === highlightedElement)) {
        highlightedElement.style.outline = "";
      }
    }

    if (
      element &&
      element !== overlay &&
      element !== document.body &&
      element !== document.documentElement
    ) {
      element.style.outline = "3px solid #FF6B6B";
      highlightedElement = element;

      const tooltip = document.getElementById("cleanweb-tooltip");
      if (tooltip) {
        tooltip.style.display = "block";
      }
    }
  }

  // Update tooltip position and content
  function updateTooltip(e, element) {
    const tooltip = document.getElementById("cleanweb-tooltip");
    if (tooltip && element) {
      const selector = generateSelector(element);
      const count = countMatches(selector);
      const rect = element.getBoundingClientRect();

      const ctrlHint =
        isCtrlPressed || selectedElements.length > 0
          ? '<div style="font-size: 11px; margin-top: 4px; color: #4CAF50; font-weight: bold;">Multi-select mode active</div>'
          : '<div style="font-size: 11px; margin-top: 4px; opacity: 0.6;">Hold Ctrl to select multiple</div>';

      tooltip.innerHTML = `
        <div style="margin-bottom: 4px; font-weight: bold;">Click to hide this element</div>
        <div style="font-size: 10px; opacity: 0.8;">
          Tag: ${element.tagName.toLowerCase()} | 
          Size: ${Math.round(rect.width)}×${Math.round(rect.height)}px | 
          Matches: ${count}
        </div>
        <div style="font-size: 10px; margin-top: 4px; font-family: monospace; opacity: 0.7;">
          ${selector.length > 40 ? selector.substring(0, 40) + "..." : selector}
        </div>
        ${ctrlHint}
      `;
      tooltip.style.left = e.clientX + 10 + "px";
      tooltip.style.top = e.clientY + 10 + "px";
    }
  }

  // Update selection counter display
  function updateCounter() {
    const counter = document.getElementById("cleanweb-selection-counter");
    if (counter) {
      if (selectedElements.length > 0) {
        counter.style.display = "block";
        counter.innerHTML = `
          ${selectedElements.length} element(s) selected
          <span style="font-size: 11px; opacity: 0.8; margin-left: 10px;">
            (Press Enter to hide all, Esc to cancel)
          </span>
        `;
      } else {
        counter.style.display = "none";
      }
    }
  }

  // Handle mouse move
  function handleMouseMove(e) {
    if (!isActive) return;

    const element = document.elementFromPoint(e.clientX, e.clientY);

    if (element && element !== overlay) {
      highlightElement(element);
      updateTooltip(e, element);
    }
  }

  // Handle click to select element
  function handleClick(e) {
    if (!isActive) return;

    e.preventDefault();
    e.stopPropagation();

    if (highlightedElement && highlightedElement !== overlay) {
      const selector = generateSelector(highlightedElement);
      const count = countMatches(selector);

      // Check if Ctrl is pressed for multi-select
      if (e.ctrlKey || e.metaKey) {
        // Add to selection
        const alreadySelected = selectedElements.some(
          (sel) => sel.selector === selector
        );

        if (!alreadySelected) {
          selectedElements.push({
            element: highlightedElement,
            selector: selector,
            count: count,
          });

          // Mark element as selected with green outline
          highlightedElement.style.outline = "3px solid #4CAF50";
          highlightedElement.setAttribute("data-cleanweb-selected", "true");
        }

        updateCounter();
      } else {
        // Single click without Ctrl - hide immediately if no selections
        if (selectedElements.length === 0) {
          // Send message to content script
          window.postMessage(
            {
              type: "CLEANWEB_ELEMENT_SELECTED",
              selector: selector,
              elementCount: count,
            },
            "*"
          );

          // Clean up
          deactivate();
        } else {
          // Add this element to selection
          selectedElements.push({
            element: highlightedElement,
            selector: selector,
            count: count,
          });
          highlightedElement.style.outline = "3px solid #4CAF50";
          highlightedElement.setAttribute("data-cleanweb-selected", "true");
          updateCounter();
        }
      }
    }
  }

  // Activate selection mode
  function activate() {
    if (isActive) return;

    isActive = true;
    selectedElements = [];
    createOverlay();

    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);
  }

  // Deactivate selection mode
  function deactivate() {
    isActive = false;

    // Clear selected elements styling
    selectedElements.forEach((sel) => {
      if (sel.element) {
        sel.element.style.outline = "";
        sel.element.removeAttribute("data-cleanweb-selected");
      }
    });
    selectedElements = [];

    if (highlightedElement) {
      highlightedElement.style.outline = "";
      highlightedElement = null;
    }

    if (overlay) {
      overlay.remove();
      overlay = null;
    }

    const tooltip = document.getElementById("cleanweb-tooltip");
    if (tooltip) {
      tooltip.remove();
    }

    const counter = document.getElementById("cleanweb-selection-counter");
    if (counter) {
      counter.remove();
    }

    document.removeEventListener("mousemove", handleMouseMove, true);
    document.removeEventListener("click", handleClick, true);
    document.removeEventListener("keydown", handleKeyDown, true);
    document.removeEventListener("keyup", handleKeyUp, true);
  }

  // Handle ESC key to cancel, Enter to confirm multi-select
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      deactivate();
    } else if (e.key === "Enter" && selectedElements.length > 0) {
      // Hide all selected elements
      e.preventDefault();

      selectedElements.forEach((sel) => {
        window.postMessage(
          {
            type: "CLEANWEB_ELEMENT_SELECTED",
            selector: sel.selector,
            elementCount: sel.count,
          },
          "*"
        );
      });

      deactivate();
    } else if (e.key === "Control" || e.key === "Meta") {
      isCtrlPressed = true;
      updateTooltip(e, highlightedElement);
    }
  }

  // Handle key up for Ctrl
  function handleKeyUp(e) {
    if (e.key === "Control" || e.key === "Meta") {
      isCtrlPressed = false;
      if (highlightedElement) {
        updateTooltip(e, highlightedElement);
      }
    }
  }

  // Listen for messages
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data.type === "CLEANWEB_DISABLE_SELECTION") {
      deactivate();
    }
  });

  // Auto-activate when script loads
  activate();
})();
