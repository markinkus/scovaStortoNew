# Anomaly Reporter Project

This project allows users to report and view anomalies associated with businesses on a map. It features a React frontend built with Vite and MUI, and a Node.js/Express backend with a SQLite database.

## Features (Overview)

*   User registration and login with JWT authentication.
*   Users can add new businesses with their locations (latitude/longitude).
*   Businesses are displayed on an interactive map (Leaflet).
*   Authenticated users can report anomalies for specific businesses, optionally including a photo URL.
*   Publicly viewable list of businesses and their reported anomalies.
*   Users can update/delete businesses and anomalies they created.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Node.js**: Version 18.x or higher (due to dependencies like `@google/genai` and `react-router-dom` which recommend Node 20.x, though 18.x might work with warnings). You can check your version with `node -v`.
*   **npm**: Version 7.x or higher (comes with Node.js). You can check your version with `npm -v`.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory_name>
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Set up environment variables:
        *   Copy the example environment file:
            ```bash
            cp .env.example .env
            ```
        *   Open the newly created `.env` file and replace `your_very_secret_key_replace_in_prod` with a strong, unique secret for `JWT_SECRET`. Set also your Google Gemini API key in `GEMINI_API_KEY` so OCR requests can be processed server-side.
            ```env
            JWT_SECRET=your_actual_strong_secret_key_here
            GEMINI_API_KEY=your_google_gemini_key
            # Optional: override default model
            GEMINI_MODEL_TEXT=gemini-2.5-flash-preview-04-17
            ```
    *   Database Synchronization:
        *   The application uses Sequelize and is configured to automatically synchronize models with the database using `sequelize.sync({ alter: true })` when the server starts. This means tables will be created or altered as needed. The SQLite database file (`database.sqlite`) will be created in the `backend` directory.
    *   Start the backend server:
        ```bash
        npm start
        ```
        The backend server will typically run on `http://localhost:3001`. You should see console output indicating "Database synchronized successfully." and "Server listening at http://localhost:3001".

3.  **Frontend Setup:**
    *   Navigate to the frontend directory (from the project root):
        ```bash
        cd frontend
        ```
        (If you are in the `backend` directory, you can use `cd ../frontend`)
    *   Install dependencies:
        ```bash
        npm install
        ```
        *Note: You might see warnings about Node.js version compatibility for packages like `@google/genai` or `react-router-dom` if you are using Node.js 18.x. The application should still run, but Node.js 20.x is recommended for these packages.*
    *   API Configuration:
        *   The frontend is configured to proxy API requests starting with `/api` to the backend server (assumed to be running on `http://localhost:3001`). This is handled by the `vite.config.ts` file in the `frontend` directory. No separate `.env` file is needed in the frontend for the API URL during development.
    *   Start the frontend development server:
        ```bash
        npm run dev
        ```
        The frontend development server will typically run on `http://localhost:3000` (as configured in `frontend/vite.config.ts`) or the next available port (e.g., 5173 if 3000 is taken, Vite will indicate the actual port). Open this URL in your web browser.

### Default Ports

*   **Frontend (Vite)**: `http://localhost:3000` (or next available, e.g., 5173)
*   **Backend (Node.js/Express)**: `http://localhost:3001`

You should now have the Anomaly Reporter application running locally! You can register a new user, log in, add businesses, and report anomalies.
```
