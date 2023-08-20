export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

export interface UserSettings {
  user: {
    username: string;
    private: boolean;
  }
}