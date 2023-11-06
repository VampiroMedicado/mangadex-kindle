import { TokenCache, TokenCredentials, TokenRefreshCredentials, TokenResponse } from "src/types/token.types";
import { cacheService } from "../utils/cacheService";
import axios from "axios";
import "dotenv/config";

const loginCredentials: TokenCredentials = {
  grant_type: "password",
  username: process.env["DEX_USERNAME"]!,
  password: process.env["DEX_PASSWORD"]!,
  client_id: process.env["SECRET_ID"]!,
  client_secret: process.env["SECRET_KEY"]!,
};

/**
 * Generates a TokenRefreshCredentials object for refreshing the token.
 *
 * @param {TokenCache} token - The token to be refreshed.
 * @return {TokenRefreshCredentials} - The generated refresh credentials.
 */
const refreshCredentials = (token: TokenCache): TokenRefreshCredentials => ({
  grant_type: "refresh_token",
  refresh_token: token.refresh_token,
  client_id: process.env["SECRET_ID"]!,
  client_secret: process.env["SECRET_KEY"]!,
});

const authDomain = "https://auth.mangadex.org";
const authPath = "/realms/mangadex/protocol/openid-connect/token";

const authInstance = axios.create({
  baseURL: authDomain,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

/**
 * This function is responsible for performing a login operation and returning a token cache.
 *
 * @return {Promise<TokenCache | undefined>} The token cache if the login is successful, otherwise undefined.
 */
async function postLogin(): Promise<TokenCache | undefined> {
  try {
    const response = await authInstance.post<TokenResponse>(authPath, loginCredentials);
    if (response.status === 200) {
      const formattedToken = formatToken(response.data);
      cacheService.writeCache("token", formattedToken, response.data.refresh_expires_in * 1000);
      return formattedToken;
    }
    return undefined;
  } catch (error) {
    throw error;
  }
}

/**
 * A function that refreshes a token in the token cache.
 *
 * @param {TokenCache} token - The token to be refreshed.
 * @return {Promise<TokenCache | undefined>} A promise that resolves to the refreshed token cache, or undefined if the refresh fails.
 */
async function postRefresh(token: TokenCache): Promise<TokenCache | undefined> {
  try {
    const response = await authInstance.post(authPath, refreshCredentials(token));
    if (response.status === 200) {
      const formattedToken = formatToken(response.data);
      cacheService.writeCache("token", formattedToken, response.data.refresh_expires_in * 1000);
      return formattedToken;
    }
    return undefined;
  } catch (error) {
    throw error;
  }
}

/**
 * Formats a token response into a TokenCache object.
 *
 * @param {TokenResponse} token - The token response to format.
 * @return {TokenCache} The formatted TokenCache object.
 */
function formatToken(token: TokenResponse): TokenCache {
  const expirationTimestamp = Date.now() + token.expires_in * 1000;
  const refreshExpirationTimestamp = Date.now() + token.refresh_expires_in * 1000;

  return {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiration_timestamp: expirationTimestamp,
    refresh_expiration_timestamp: refreshExpirationTimestamp,
    token_type: token.token_type,
  };
}

let token: TokenCache | undefined = undefined;

/**
 * Retrieves and returns the token from the cache if it is still valid. 
 * If the token is expired, it refreshes the token and returns the updated token.
 *
 * @return {Promise<TokenCache>} The retrieved or refreshed token.
 */
async function getToken(): Promise<TokenCache> {
  try {
    if (token && token.expiration_timestamp && token.expiration_timestamp > Date.now()) {
      return token;
    }
    token = cacheService.readCache<TokenCache>("token") ?? (await postLogin());
    if (token && token.expiration_timestamp && token.expiration_timestamp < Date.now()) {
      console.log("Token expired. Refreshing token...");
      token = await postRefresh(token);
    }
    if (!token) {
      throw new Error("Failed to retrieve or refresh the token");
    }
    console.log("Returning token.");
    return token;
  } catch (error) {
    console.error("An error occurred while fetching the token:", error);
    throw error;
  }
}

export { getToken };
