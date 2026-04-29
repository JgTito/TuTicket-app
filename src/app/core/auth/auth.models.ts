export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface RegisterRequest {
  nombreCompleto: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  nombreCompleto: string;
  email: string | null;
  userName: string | null;
  roles: string[];
  token: string;
  expira: string;
}
