# Run this script with: PowerShell -ExecutionPolicy Bypass -File install-packages.ps1
Write-Host "Installing packages..." -ForegroundColor Green

# Install base packages
npm install react react-dom @chakra-ui/react @chakra-ui/icons @emotion/react @emotion/styled framer-motion react-router-dom axios --legacy-peer-deps

# Install dev dependencies
npm install --save-dev @types/react @types/react-dom @types/node typescript tailwindcss postcss autoprefixer @vitejs/plugin-react vite

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "After installation, you should be able to start the application with:" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit" 