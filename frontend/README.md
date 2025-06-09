# Reading List App Frontend

This is the frontend for the Reading List application built with React, TypeScript, Vite, Chakra UI, and TailwindCSS.

## Setup Instructions

Due to execution policy restrictions in PowerShell, you'll need to follow these steps to install the dependencies:

### Option 1: Using Command Prompt

1. Open Command Prompt (cmd.exe) and navigate to the frontend directory
2. Run the installation batch file:
   ```
   install-packages.bat
   ```

### Option 2: Using PowerShell with Execution Policy Bypass

1. Open PowerShell as Administrator 
2. Run the following command to temporarily bypass the execution policy:
   ```
   PowerShell -ExecutionPolicy Bypass -File install-packages.ps1
   ```

### Option 3: Manual Installation

If you're still having issues, you can try these steps:

1. Open Command Prompt (not PowerShell) and navigate to the frontend directory
2. Run the following commands:
   ```
   npm install react react-dom @chakra-ui/react @chakra-ui/icons @emotion/react @emotion/styled framer-motion react-router-dom axios --legacy-peer-deps
   npm install --save-dev @types/react @types/react-dom @types/node typescript tailwindcss postcss autoprefixer @vitejs/plugin-react vite
   ```

## Running the Application

After installing the dependencies, you can start the application with:

```
npm run dev
```

## Troubleshooting

- If you see TypeScript errors related to missing modules, ensure all dependencies were properly installed.
- If PowerShell prevents you from running npm commands, try using Command Prompt instead.
- You may need to restart your IDE after installing dependencies for TypeScript to properly recognize the installed packages. 