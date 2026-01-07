
// Dynamically determine the API base URL based on the current window location
// This allows the app to work when accessed from other devices on the network

export const getApiBaseUrl = () => {
    // If VITE_API_URL is defined in .env, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Otherwise, construct it from the current hostname
    // Assuming the backend runs on port 3001
    // This allows access from other devices like 192.168.x.x
    return `http://${window.location.hostname}:3001`;
};

export const API_BASE_URL = getApiBaseUrl();
