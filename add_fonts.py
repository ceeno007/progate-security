
import os

path = "ios/progatesecurity/Info.plist"
with open(path, 'r') as f:
    content = f.read()

# Add Ionicons font
if "Ionicons.ttf" not in content:
    print("Adding UIAppFonts...")
    target = "<key>UIViewControllerBasedStatusBarAppearance</key>\n    <false/>"
    replacement = target + "\n    <key>UIAppFonts</key>\n    <array>\n      <string>Ionicons.ttf</string>\n      <string>Feather.ttf</string>\n      <string>MaterialIcons.ttf</string>\n    </array>"
    new_content = content.replace(target, replacement)
    
    with open(path, 'w') as f:
        f.write(new_content)
    print("Added Fonts to Info.plist")
else:
    print("Fonts already in Info.plist")
