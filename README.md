# CleanWeb Customizer

A powerful Chrome extension that allows you to hide unwanted elements on websites and keep your browsing experience clean across visits.

## Features

### ✨ Core Features

- **Element Selection**: Click to select and hide any element on a webpage
- **Persistent Rules**: Hidden elements stay hidden on future visits
- **Domain-Specific**: Rules apply only to specific domains
- **Visual Feedback**: Hover preview with element info before selecting

### ⌨️ Keyboard Shortcuts

- **Ctrl+Shift+H** (Cmd+Shift+H on Mac) - Toggle element selection mode
- **Ctrl+Shift+U** (Cmd+Shift+U on Mac) - Undo last hidden element
- **Ctrl+Shift+T** (Cmd+Shift+T on Mac) - Toggle all rules on/off for current site
- **ESC** - Cancel selection mode

### 🎯 Advanced Features

- **Multi-Select Mode**: Hold Ctrl and click to select multiple elements, then press Enter to hide them all
- **Context Menu**: Right-click anywhere → "Hide this element"
- **Undo Support**: Undo last hidden element with one click
- **Temporary Preview**: Show all hidden elements temporarily (5 seconds)
- **Badge Counter**: Shows number of hidden elements for current site
- **Search & Filter**: Search through all rules in the options page
- **Element Preview**: See element info (tag, size, matches count) before hiding
- **Smart Notifications**: Visual feedback when hiding/showing elements
- **Export/Import**: Backup and restore your rules across devices or browsers

### 📋 Common Templates (Coming Soon)

Pre-built rules for:

- Cookie banners
- Newsletter popups
- Social media widgets
- Autoplay videos
- Comments sections
- Chat widgets
- Notification bars

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the extension folder

## Usage

### Hiding Elements

**Single Element:**

1. Click the extension icon in your browser toolbar
2. Click "Start Selection" button (or press Ctrl+Shift+H)
3. Hover over elements on the page (they will be highlighted in red)
4. Click on the element you want to hide
5. The element will be hidden immediately and on future visits

**Multiple Elements:**

1. Start selection mode as above
2. Hold **Ctrl** (or Cmd on Mac) while clicking elements
3. Selected elements will turn **green** and a counter will appear
4. Press **Enter** to hide all selected elements
5. Press **ESC** to cancel

### Export/Import Rules

**Export (Backup your rules):**

- Click the extension icon → Click "📥 Export" button
- Or go to Options page → Click "Export Rules"
- A JSON file will be downloaded with timestamp (e.g., `cleanweb-rules-2025-12-04T10-30-00.json`)

**Import (Restore rules):**

- Click the extension icon → Click "📂 Import" button
- Or go to Options page → Click "Import Rules"
- Select your previously exported JSON file
- Rules will be merged with existing rules (duplicates are automatically removed)
- You'll see a notification showing how many rules were imported

### Managing Rules

#### Popup (Quick Access)

- View current domain and number of hidden elements
- See all rules for the current site
- Remove individual rules
- Clear all rules for current domain

#### Options Page (Full Management)

- View all rules across all domains
- See statistics (total domains and rules)
- **Export rules**: Download all rules as JSON file for backup
- **Import rules**: Upload and merge rules from JSON file
- Search and filter rules by domain or selector
- Clear rules by domain or clear everything

## File Structure

```
Extension/
├── manifest.json           # Extension configuration (V3)
├── background.js          # Service worker for background tasks
├── contentScript.js       # Main content script injected on pages
├── selectionOverlay.js    # Element selection interface
├── storage.js            # Storage management utilities
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic
├── popup.css             # Popup and options styling
├── options.html          # Full management page
├── options.js            # Options page logic
├── overlay.css           # Selection overlay styles
└── README.md             # This file
```

## Technical Details

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Storage**: Chrome Sync Storage (syncs across devices)
- **Permissions**:
  - `storage` - Save hidden element rules
  - `activeTab` - Access current tab
  - `scripting` - Inject content scripts
  - `<all_urls>` - Work on all websites

## CSS Selector Generation

The extension generates CSS selectors in the following priority:

1. `#id` - If element has an ID
2. `.class1.class2` - If element has classes
3. `parent > tag:nth-child(n)` - Fallback with parent context

## Limitations

- Some websites with strict Content Security Policy (CSP) may limit functionality
- Dynamic content may require re-selection if structure changes significantly
- Maximum storage: Chrome Sync Storage limits (100KB per item, 102,400 bytes total)

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Rules sync only through your Chrome account (if sync is enabled)

## Support

For issues or feature requests, please visit the project repository.

## License

MIT License - Feel free to modify and distribute

## Version History

- **1.0.0** - Initial release
  - Element selection and hiding
  - Domain-specific rules
  - Management interface
  - Export/Import functionality
