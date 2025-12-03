import { BASE_URL } from './base';

export function openGoogleLogin() {
  window.location.href = `${BASE_URL}/oauth2/authorization/google`;
}
