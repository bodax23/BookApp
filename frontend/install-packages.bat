@echo off
echo Installing packages...

REM Install base packages
npm install react react-dom @chakra-ui/react @chakra-ui/icons @emotion/react @emotion/styled framer-motion react-router-dom axios --legacy-peer-deps

REM Install dev dependencies
npm install --save-dev @types/react @types/react-dom @types/node typescript tailwindcss postcss autoprefixer @vitejs/plugin-react vite

echo Installation complete!
echo.
echo After installation, you should be able to start the application with:
echo npm run dev
echo.
pause 