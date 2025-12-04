# Icon Setup Instructions

The extension needs icons in three sizes: 16x16, 48x48, and 128x128 pixels.

## Quick Setup (Recommended)

### Option 1: Use an online tool

1. Go to https://www.iloveimg.com/resize-image or https://www.resizeimage.net/
2. Upload your icon image
3. Resize to 16x16, 48x48, and 128x128 pixels (create 3 separate files)
4. Save them as:
   - `icons/icon16.png`
   - `icons/icon48.png`
   - `icons/icon128.png`

### Option 2: Use Python (if installed)

Run this script in the Extension folder:

```python
from PIL import Image
import os

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Path to your original icon
original_icon = 'path/to/your/icon.png'  # Update this path

# Open and resize
img = Image.open(original_icon)

# Create different sizes
sizes = [16, 48, 128]
for size in sizes:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(f'icons/icon{size}.png')

print('Icons created successfully!')
```

### Option 3: Use ImageMagick (if installed)

```bash
magick convert your-icon.png -resize 16x16 icons/icon16.png
magick convert your-icon.png -resize 48x48 icons/icon48.png
magick convert your-icon.png -resize 128x128 icons/icon128.png
```

### Option 4: Manual (Windows Paint)

1. Open your icon in Paint
2. Resize to 16x16 pixels, save as `icon16.png`
3. Repeat for 48x48 and 128x128

## What if I don't add icons?

The extension will still work, but:

- Chrome will show a default extension icon
- It won't look as professional

You can temporarily remove the icon references from `manifest.json` if you want to test without icons.
