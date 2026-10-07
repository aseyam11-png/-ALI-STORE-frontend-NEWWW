$ErrorActionPreference = "Stop"

Write-Host "Installing ALI STORE Design System tooling..."

if (Test-Path ".storybook/main.ts") {
  Write-Host "Storybook configuration already exists; skipping project generator."
} else {
  npm create storybook@10.6.1 -- --type nextjs-vite --yes
}

npm install --save-dev `
  "@storybook/addon-a11y@10.6.1" `
  "@storybook/addon-vitest@10.6.1" `
  "@storybook/addon-designs@11.1.4" `
  "vitest@5.0.3" `
  "@vitest/browser-playwright@5.0.3" `
  "playwright@latest" `
  "style-dictionary@5.5.5" `
  "eslint-plugin-jsx-a11y@6.10.2" `
  "stylelint@17.16.0"

npm install --save-dev "playroom@1.3.0"

Write-Host "Install Chromium for Storybook tests:"
Write-Host "  npx playwright install chromium"

Write-Host "Run:"
Write-Host "  npm run design-system:check"
Write-Host "  npm run design-tokens"
Write-Host "  npm run storybook"
Write-Host "  npm run test-storybook"
Write-Host "  npm run playroom:start"
