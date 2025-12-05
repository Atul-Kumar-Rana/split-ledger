import { BASE_URL } from './base';

export function openGoogleLogin() {
  window.location.href = `/oauth2/authorization/google`;
}
