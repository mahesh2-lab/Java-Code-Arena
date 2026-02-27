export const getBaseUrl = () => {
    const overrideUrl = import.meta.env.VITE_API_URL;
    if (overrideUrl) return overrideUrl;

    // Check if we're running in development (usually port 5173 for Vite)
    // If we're on port 5000 (served by Python), we can use relative URLs
    const isDev = window.location.port === "5173" || window.location.port === "3000";

    if (!isDev) {
        // In production (served by Flask), using an empty string enables relative requests.
        // This solves "Blocked Mixed Content" because the browser will match the 
        // protocol (HTTP/HTTPS) of the current page automatically.
        return "";
    }

    const port = import.meta.env.VITE_BACKEND_PORT || "5000";
    const hostname = window.location.hostname;

    // Local development: connect to the separate backend server
    return `http://${hostname}:${port}`;
};

export async function fetchApi<T = any>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const fullUrl = url.startsWith('/') ? `${getBaseUrl()}${url}` : url;
    const response = await fetch(fullUrl, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
}
