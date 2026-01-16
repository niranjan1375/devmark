const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export const api = {
  // Auth
  register: async (email: string, password: string, name?: string) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getMe: async () => {
    const response = await apiRequest('/api/auth/me');
    if (!response.ok) throw new Error('Unauthorized');
    return response.json();
  },

  // Bookmarks
  getBookmarks: async () => {
    const response = await apiRequest('/api/bookmarks');
    if (!response.ok) throw new Error('Failed to fetch bookmarks');
    return response.json();
  },

  getBookmark: async (id: string) => {
    const response = await apiRequest(`/api/bookmarks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch bookmark');
    return response.json();
  },

  createBookmark: async (data: {
    url: string;
    title: string;
    note: string;
    tags: string[];
  }) => {
    const response = await apiRequest('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create bookmark');
    }
    return response.json();
  },

  updateBookmark: async (
    id: string,
    data: {
      url?: string;
      title?: string;
      note?: string;
      tags?: string[];
    }
  ) => {
    const response = await apiRequest(`/api/bookmarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update bookmark');
    }
    return response.json();
  },

  deleteBookmark: async (id: string) => {
    const response = await apiRequest(`/api/bookmarks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete bookmark');
  },

  searchBookmarks: async (params: { tag?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params.tag) query.append('tag', params.tag);
    if (params.search) query.append('search', params.search);
    
    const response = await apiRequest(`/api/bookmarks/search?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to search bookmarks');
    return response.json();
  },

  // Tags
  getTags: async () => {
    const response = await apiRequest('/api/tags');
    if (!response.ok) throw new Error('Failed to fetch tags');
    return response.json();
  },
};
