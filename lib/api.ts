const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string } }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  signup: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string } }>('/api/auth/signup', {
      method: 'POST',
      body: { email, password },
    }),

  // Documents
  upload: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `Upload failed (${response.status})`);
    }
    return response.json();
  },

  getDocuments: (token: string) =>
    request<{ documents: Array<{ _id: string; status: string; created_at: string }> }>(
      '/api/documents',
      { token }
    ),

  getDocument: (id: string, token: string) =>
    request<{
      document_id: string;
      status: string;
      extraction?: object;
      action_plan?: object;
      audit?: object;
    }>(`/api/document/${id}`, { token }),

  processDocument: (id: string, token: string) =>
    request<{ document_id: string; status: string }>(`/api/process/${id}`, {
      method: 'POST',
      token,
    }),

  reviewDocument: (id: string, decision: string, editedOutput?: object, token?: string) =>
    request<{ document_id: string; status: string }>(`/api/review/${id}`, {
      method: 'POST',
      body: { decision, edited_output: editedOutput },
      token,
    }),

  deleteDocument: (id: string, token: string) =>
    request<{ success: boolean; message: string }>(`/api/document/${id}`, {
      method: 'DELETE',
      token,
    }),
};
