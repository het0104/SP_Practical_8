# Product inventory

A React and Vite frontend for the Express product API.

## Run locally

Open two terminals from the `practical-8` directory:

```powershell
cd backend
npm.cmd install
npm.cmd start
```

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

The API runs at `http://localhost:5000`; set the backend `PORT` environment variable to use another port. The Vite development server prints the frontend URL after it starts. Product data is held in backend memory and resets when the backend restarts.
