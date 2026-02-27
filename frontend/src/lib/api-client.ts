export const getBaseUrl = () => {
    const overrideUrl = import.meta.env.VITE_API_URL;
    if (overrideUrl) return overrideUrl;
    const port = import.meta.env.VITE_BACKEND_PORT || "5000";
    return `http://${window.location.hostname}:${port}`;
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
