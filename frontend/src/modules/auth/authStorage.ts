enum AuthStorageKeys {
  Token = "greenhouse:token",
  Name = "greenhouse:name",
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem(AuthStorageKeys.Token));
}

export function getName() {
  return localStorage.getItem(AuthStorageKeys.Name) || "";
}

export function getToken() {
  return localStorage.getItem(AuthStorageKeys.Token);
}

export function clearToken() {
  localStorage.removeItem(AuthStorageKeys.Token);
}

export function offlineLogin(name: string, token: string) {
  localStorage.setItem(AuthStorageKeys.Name, name);
  localStorage.setItem(AuthStorageKeys.Token, token);
}

export function offlineLogout() {
  localStorage.removeItem(AuthStorageKeys.Name);
  localStorage.removeItem(AuthStorageKeys.Token);

  // eslint-disable-next-line no-restricted-globals
  location.reload();
}
