# Export/Import Rules Guide

## Overview

CleanWeb Customizer allows you to backup and restore your hidden element rules using JSON files. This is useful for:

- 🔄 **Backup**: Keep a safe copy of your rules
- 🖥️ **Sync across devices**: Transfer rules between computers
- 👥 **Share**: Share rules with others
- 🔧 **Version control**: Track changes to your rules over time

## File Format

Rules are exported as JSON files with the following structure:

```json
{
  "example.com": ["div.cookie-banner", "#newsletter-popup", "aside.sidebar-ad"],
  "another-site.com": [".social-share-buttons", "iframe[src*='ads']"]
}
```

Each domain is a key, and the value is an array of CSS selectors.

## How to Export Rules

### Method 1: From Popup (Quick Access)

1. Click the extension icon in your browser toolbar
2. Click the **"📥 Export"** button
3. A JSON file will be automatically downloaded
4. Filename format: `cleanweb-rules-YYYY-MM-DDTHH-MM-SS.json`

### Method 2: From Options Page

1. Right-click the extension icon → **"Options"**
2. Or click **"Manage All Rules"** in the popup
3. Click the **"Export Rules"** button at the top
4. The file will be downloaded to your default downloads folder

## How to Import Rules

### Method 1: From Popup (Quick Access)

1. Click the extension icon in your browser toolbar
2. Click the **"📂 Import"** button
3. Select your JSON file from the file picker
4. Rules will be merged with your existing rules
5. A success notification will show how many rules were imported

### Method 2: From Options Page

1. Go to the Options page
2. Click the **"Import Rules"** button at the top
3. Select your JSON file
4. View the results in the notification

## Important Notes

### Merging Rules

- **Duplicates are automatically removed**: If you import a rule that already exists, it won't be duplicated
- **Existing rules are preserved**: Import doesn't delete your current rules
- **Domains are merged**: If you have 3 rules for "example.com" and import 2 more, you'll have 5 total (if unique)

### Example Merge Behavior

**Before Import:**

```json
{
  "example.com": ["div.ad", "#popup"]
}
```

**Importing:**

```json
{
  "example.com": ["div.ad", "aside.banner"],
  "newsite.com": [".cookie"]
}
```

**After Import:**

```json
{
  "example.com": ["div.ad", "#popup", "aside.banner"],
  "newsite.com": [".cookie"]
}
```

## Use Cases

### 1. Backup Before Clearing

```
1. Export rules → Save file
2. Clear all rules (testing/cleanup)
3. Import rules → Restore everything
```

### 2. Transfer Between Browsers

```
Browser A: Export → Save to cloud/USB
Browser B: Import → All rules copied
```

### 3. Share with Team

```
1. Create rules for work websites
2. Export to shared folder
3. Team members import the same rules
```

### 4. Version Control

```
1. Export rules weekly
2. Save with descriptive names:
   - cleanweb-rules-2025-12-04-before-cleanup.json
   - cleanweb-rules-2025-12-04-final.json
3. Restore any version if needed
```

## File Storage Tips

### Recommended Naming Convention

- `cleanweb-rules-YYYY-MM-DD.json` - Daily backups
- `cleanweb-rules-[description].json` - Specific purposes
  - `cleanweb-rules-work-sites.json`
  - `cleanweb-rules-news-sites.json`
  - `cleanweb-rules-social-media.json`

### Storage Locations

- **Cloud storage**: Google Drive, Dropbox, OneDrive
- **Version control**: Git repository (for tech users)
- **USB drive**: Offline backup
- **Email**: Send to yourself for access anywhere

## Troubleshooting

### Import Failed: "Invalid file format"

**Possible causes:**

- File is corrupted
- File is not valid JSON
- File was edited incorrectly

**Solution:**

- Re-export from a working installation
- Validate JSON at [jsonlint.com](https://jsonlint.com)
- Check that the structure matches the format above

### Imported but Rules Not Working

**Possible causes:**

- Website structure changed
- Selectors are too specific/generic

**Solution:**

1. Go to the website
2. Check if elements still exist
3. Re-select elements if needed
4. Export new backup

### Storage Limit Exceeded

Chrome Sync Storage has limits:

- **100KB per item**
- **~100KB total for all data**

**Solution:**

- Export and save externally
- Clear old/unused domain rules
- Use import only when needed

## Advanced: Manual Editing

You can manually edit the JSON file before importing:

### Remove a Domain

```json
{
  "example.com": ["div.ad"],
  "unwanted-site.com": ["..."] // Delete this line
}
```

### Add Rules Manually

```json
{
  "example.com": [
    "div.ad",
    "aside.banner" // Add new selector
  ]
}
```

### Combine Multiple Exports

```json
// File 1
{
  "site1.com": ["rule1"]
}

// File 2
{
  "site2.com": ["rule2"]
}

// Combined
{
  "site1.com": ["rule1"],
  "site2.com": ["rule2"]
}
```

## Security & Privacy

- ✅ Files stay local - nothing is uploaded to servers
- ✅ Only JSON format - no executable code
- ✅ Files can be inspected in any text editor
- ⚠️ Files contain list of websites you configured - keep private if sensitive

## Best Practices

1. **Regular Backups**: Export monthly or when you have many rules
2. **Descriptive Names**: Use clear filenames for easy identification
3. **Cloud Backup**: Store in cloud for access anywhere
4. **Test Imports**: Try importing on a test profile first
5. **Version Control**: Keep old versions for a while
6. **Clean Before Export**: Remove unused rules before backing up

## Quick Reference

| Action | Location | Button       |
| ------ | -------- | ------------ |
| Export | Popup    | 📥 Export    |
| Import | Popup    | 📂 Import    |
| Export | Options  | Export Rules |
| Import | Options  | Import Rules |

| Shortcut     | Action                          |
| ------------ | ------------------------------- |
| After Export | Check Downloads folder          |
| After Import | Check notification for count    |
| File Name    | cleanweb-rules-[timestamp].json |
| File Format  | Standard JSON                   |

---

**Need Help?** If you encounter issues, check that:

1. File is valid JSON format
2. File follows the correct structure
3. You have storage space available
4. Extension has proper permissions
