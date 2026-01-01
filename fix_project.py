
import os
import re

path = "ios/progatesecurity.xcodeproj/project.pbxproj"
with open(path, 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "react-native-xcode.sh" in line:
        found_line = line.strip()
        
        # Find the index of react-native-xcode.sh
        idx = found_line.find("react-native-xcode.sh")
        # Print surroundings
        start = max(0, idx - 100)
        end = min(len(found_line), idx + 20)
        print(f"Snippet: {found_line[start:end]}")
        
        # Try to find the backtick
        backtick_idx = found_line.rfind('`', 0, idx)
        if backtick_idx != -1:
             print(f"Backtick found at {backtick_idx}")
             print(f"Chars around backtick: {found_line[backtick_idx-5:backtick_idx+5]}")
        
        # Match using exact substring found
        target_str = '`\\"$NODE_BINARY\\" --print \\"require(\'path\').dirname(require.resolve(\'react-native/package.json\')) + \'/scripts/react-native-xcode.sh\'\\"`'
        
        if target_str in found_line:
            print("Exact string match found!")
            replacement = r'\"' + target_str + r'\"'
            lines[i] = lines[i].replace(target_str, replacement)
            with open(path, 'w') as f:
                f.writelines(lines)
            print("Applied fix.")
        else:
            print("Exact string match FAILED. Trying to construct it.")
            # Let's see what is actually there
            # Construct regex loosely
            match = re.search(r'`.*?react-native-xcode\.sh.*?`', found_line)
            if match:
                s = match.group(0)
                print(f"Matched group: {s}")
                replacement = r'\"' + s + r'\"'
                lines[i] = lines[i].replace(s, replacement)
                with open(path, 'w') as f:
                    f.writelines(lines)
                print("Applied fix via loose regex.")
        break
