type ApiFetchOptions = RequestInit & {
  parse?: boolean;
};

export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const isJson =
    options.parse ?? response.headers.get("content-type")?.includes("json");

  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.error;
    throw new Error(message || "Erro ao comunicar com o servidor");
  }

  return data as T;
}

