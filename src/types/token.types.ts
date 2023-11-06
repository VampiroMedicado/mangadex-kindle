/**
 * Represents the response received from the token API.
 */
export type TokenResponse = {
  access_token: string; // The access token.
  expires_in: number; // The number of seconds until the access token expires.
  refresh_expires_in: number; // The number of seconds until the refresh token expires.
  refresh_token: string; // The refresh token.
  token_type: string; // The type of token.
  "not-before-policy": string; // The not-before-policy.
  session_state: string; // The session state.
  scope: string; // The scope of the token.
  client_type: string; // The type of client.
};

/**
 * Represents the token cache.
 */
export type TokenCache = {
  access_token: string; // The access token.
  refresh_token: string; // The refresh token.
  expiration_timestamp: number; // The timestamp when the access token expires.
  refresh_expiration_timestamp: number; // The timestamp when the refresh token expires.
  token_type: string; // The type of token.
};

/**
 * Represents the credentials for obtaining a token.
 */
export type TokenCredentials = {
  grant_type: "password"; // The grant type.
  username: string; // The username.
  password: string; // The password.
  client_id: string; // The client ID.
  client_secret: string; // The client secret.
};

/**
 * Represents the credentials for refreshing a token.
 */
export type TokenRefreshCredentials = {
  grant_type: "refresh_token"; // The grant type.
  refresh_token: string; // The refresh token.
  client_id: string; // The client ID.
  client_secret: string; // The client secret.
};