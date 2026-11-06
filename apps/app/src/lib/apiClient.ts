const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let accessToken: string | undefined;
let onAuthFailure: (() => void) | undefined;

export function setAccessToken(token: string | undefined): void {
  accessToken = token;
}

export function setOnAuthFailure(callback: (() => void) | undefined): void {
  onAuthFailure = callback;
}

interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message: string };
}

async function rawRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      body.error?.code ?? 'UNKNOWN_ERROR',
      body.error?.message ?? 'Erreur inconnue',
    );
  }

  return body.data as T;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const result = await rawRequest<{ accessToken: string }>('/auth/refresh', { method: 'POST' });
    setAccessToken(result.accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, init);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 401 && path !== '/auth/refresh') {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return rawRequest<T>(path, init);
      }
      setAccessToken(undefined);
      onAuthFailure?.();
    }
    throw err;
  }
}

export const apiClient = {
  get: <T>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    apiRequest<T>(path, { method: 'POST', body: formData }),
};

/** Telecharge un fichier prive (facture...) en injectant le jeton d'acces, puis declenche l'enregistrement. */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    throw new ApiClientError(response.status, 'DOWNLOAD_FAILED', 'Telechargement impossible');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
