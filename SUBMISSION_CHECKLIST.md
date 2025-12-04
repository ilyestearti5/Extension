# Chrome Web Store Submission Checklist

## Before Submitting

### 1. Required Files ✓

- [x] manifest.json (version 3)
- [x] Icon files (16x16, 48x48, 128x128)
- [x] All source files
- [x] Privacy policy
- [x] README.md

### 2. Icons Required for Store

You need additional promotional images:

- [ ] **128x128 icon** (already have ✓)
- [ ] **440x280 small promo tile** (recommended)
- [ ] **920x680 marquee promo tile** (optional but recommended)
- [ ] **1400x560 marquee promo tile** (optional)
- [ ] **Screenshots** (at least 1, max 5 recommended):
  - Recommended size: 1280x800 or 640x400
  - Show the extension in action
  - Show the popup interface
  - Show element selection
  - Show hidden elements list

### 3. Test Your Extension

- [ ] Test in Chrome browser
- [ ] Test all features work
- [ ] Test on multiple websites
- [ ] Test keyboard shortcuts
- [ ] Test export/import functionality
- [ ] Check for console errors
- [ ] Verify all permissions are needed

### 4. Create ZIP Package

Package ONLY these files (no folders above them):

```
manifest.json
background.js
contentScript.js
storage.js
templates.js
selectionOverlay.js
popup.html
popup.css
popup.js
options.html
options.js
overlay.css
icons/
  icon16.png
  icon48.png
  icon128.png
PRIVACY_POLICY.md
README.md
```

**DO NOT include:**

- node_modules/
- .git/
- package.json (if not needed)
- create_icons.js
- Any development files
- This checklist

### 5. Chrome Web Store Account

- [ ] Create Google developer account: https://chrome.google.com/webstore/devconsole
- [ ] Pay $5 one-time registration fee

### 6. Submission Steps

1. **Go to Chrome Web Store Developer Dashboard**

   - Visit: https://chrome.google.com/webstore/devconsole

2. **Click "New Item"**

3. **Upload ZIP file**

   - Upload your extension package

4. **Fill Store Listing**

   - Product name: CleanWeb Customizer
   - Summary: (Use short description from STORE_LISTING.md)
   - Description: (Use detailed description from STORE_LISTING.md)
   - Category: Productivity
   - Language: English

5. **Upload Assets**

   - Extension icon (128x128) ✓
   - Screenshots (1-5 images)
   - Small promo tile (440x280) - recommended
   - Marquee tiles (optional)

6. **Privacy Practices**

   - Add privacy policy URL or text
   - Justify permissions usage
   - Data usage disclosure

7. **Distribution**

   - Set visibility (Public/Unlisted/Private)
   - Choose countries/regions
   - Set pricing (Free)

8. **Submit for Review**
   - Review all information
   - Click "Submit for Review"
   - Wait for approval (usually 1-3 days)

## Post-Submission

### After Approval

- [ ] Test the published extension
- [ ] Monitor reviews
- [ ] Respond to user feedback
- [ ] Plan updates based on feedback

### Updates

When you need to update:

1. Increment version in manifest.json
2. Create new ZIP
3. Upload to same item in dashboard
4. Submit for review

## Important Notes

⚠️ **Review Process:**

- First submission usually takes 1-3 days
- Can take longer if issues found
- Extension must comply with Chrome Web Store policies

⚠️ **Common Rejection Reasons:**

- Missing or unclear privacy policy
- Unnecessary permissions
- Unclear functionality
- Poor quality icons/screenshots
- Misleading description

⚠️ **Best Practices:**

- Be transparent about what your extension does
- Only request permissions you actually use
- Provide clear, quality screenshots
- Write detailed, accurate descriptions
- Include good support/contact information

## Helpful Links

- Developer Dashboard: https://chrome.google.com/webstore/devconsole
- Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Branding Guidelines: https://developer.chrome.com/docs/webstore/branding/
- Best Practices: https://developer.chrome.com/docs/webstore/best_practices/

## Need Help?

If you need help with:

- Creating promotional images/screenshots
- Writing better descriptions
- Testing specific features
- Debugging issues

Just ask!
