$ErrorActionPreference = "Stop"
Write-Host "Installing ALI STORE Design System tooling..."
npm create storybook@10.6.1 -- --type nextjs-vite --yes
npm install --save-dev "@storybook/addon-a11y@10.6.1" "@storybook/addon-vitest@10.6.1" "@storybook/addon-designs@11.1.4" "style-dictionary@5.5.5" "eslint-plugin-jsx-a11y@6.10.2" "stylelint@latest"
Write-Host "Optional P2: npm install --save-dev playroom@latest"
Write-Host "Run: npm run design-system:check; npm run design-tokens; npm run storybook"
