export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  count?: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  note: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateBookmarkInput {
  url: string;
  title: string;
  note: string;
  tags: string[];
}

export interface UpdateBookmarkInput {
  url?: string;
  title?: string;
  note?: string;
  tags?: string[];
}
