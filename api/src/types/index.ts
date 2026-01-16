export interface JWTPayload {
  id: string;
  email: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
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
