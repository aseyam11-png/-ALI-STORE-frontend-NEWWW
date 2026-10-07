$ErrorActionPreference = "Stop"

Write-Host "ALI STORE UX tooling"
Write-Host ""
Write-Host "This setup uses Storybook's recommended Next.js + Vite framework."
Write-Host "It will update package.json/package-lock.json and generate .storybook/."
Write-Host ""

npm create storybook@10.6.1 -- --type nextjs-vite
npx storybook@10.6.1 add @storybook/addon-vitest

Write-Host ""
Write-Host "Storybook setup completed."
Write-Host "Run: npm run storybook"
Write-Host "Run component tests with the Storybook/Vitest project after setup."
