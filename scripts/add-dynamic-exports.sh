#!/bin/bash

# Add dynamic exports to all API route files
find app/api -name "route.ts" -type f | while read file; do
  # Check if the file already has the dynamic export
  if ! grep -q "export const dynamic" "$file"; then
    # Add the exports after the imports
    sed -i '' '/^import.*$/,/^[^i]/{
      /^[^i]/{
        i\
\
// Prevent static optimization during build\
export const dynamic = '\''force-dynamic'\'';\
export const runtime = '\''nodejs'\'';\

      }
    }' "$file"
    echo "Updated: $file"
  else
    echo "Skipped (already has dynamic): $file"
  fi
done