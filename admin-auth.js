(function setupWeddingAdminAuthentication() {
  const apiKey = "AIzaSyDxT1IkB976AcN1gsjEDlOENQse5RB9JmI";
  const adminUid = "7eOHTBOtUZMOMT4hpW76hv7Xo3z2";
  const adminEmailAddress = "kjayasimha2003@gmail.com";
  const sessionKey = "weddingFirebaseAdminSession";
  const isAdminPage = new URLSearchParams(location.search).get("admin") === "jayasimha";

  const dialog = document.getElementById("adminLoginDialog");
  const form = document.getElementById("adminLoginForm");
  const emailInput = document.getElementById("adminEmail");
  const passwordInput = document.getElementById("adminPassword");
  const status = document.getElementById("adminLoginStatus");
  const resetButton = document.getElementById("resetAdminPassword");
  const signOutButton = document.getElementById("signOutAdmin");

  let session = readSession();
  let readyResolved = false;
  let resolveReady;
  const ready = new Promise((resolve) => { resolveReady = resolve; });

  function setLoginStatus(message) {
    if (status) status.textContent = message;
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(sessionKey) || "null");
    } catch (error) {
      return null;
    }
  }

  function saveSession(nextSession) {
    session = nextSession;
    localStorage.setItem(sessionKey, JSON.stringify(nextSession));
  }

  function clearSession() {
    session = null;
    localStorage.removeItem(sessionKey);
  }

  function finishReady(value) {
    if (readyResolved) return;
    readyResolved = true;
    resolveReady(value);
  }

  function showLogin() {
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setLoginStatus("Sign in with the Firebase admin account.");
  }

  function closeLogin() {
    if (dialog?.open) dialog.close();
    if (passwordInput) passwordInput.value = "";
  }

  async function signIn(email, password) {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "LOGIN_FAILED");
    if (result.localId !== adminUid) throw new Error("NOT_AUTHORIZED");

    saveSession({
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      uid: result.localId,
      email: result.email,
      expiresAt: Date.now() + (Number(result.expiresIn || 3600) * 1000) - 60000
    });
    return session;
  }

  async function refreshSession() {
    if (!session?.refreshToken) throw new Error("LOGIN_REQUIRED");
    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: session.refreshToken })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "SESSION_EXPIRED");
    if (result.user_id !== adminUid) throw new Error("NOT_AUTHORIZED");

    saveSession({
      idToken: result.id_token,
      refreshToken: result.refresh_token,
      uid: result.user_id,
      email: session.email || adminEmailAddress,
      expiresAt: Date.now() + (Number(result.expires_in || 3600) * 1000) - 60000
    });
    return session;
  }

  async function getValidToken() {
    if (!session || session.uid !== adminUid) throw new Error("LOGIN_REQUIRED");
    if (!session.idToken || Date.now() >= Number(session.expiresAt || 0)) await refreshSession();
    return session.idToken;
  }

  async function verifyStoredSession() {
    const token = await getValidToken();
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    });
    const result = await response.json();
    if (!response.ok || result.users?.[0]?.localId !== adminUid) throw new Error("SESSION_INVALID");
    return true;
  }

  async function authFetch(url, options = {}) {
    const token = await getValidToken();
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...options, headers });
  }

  async function sendPasswordReset(email = adminEmailAddress) {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "RESET_FAILED");
    return result;
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      setLoginStatus("Signing in securely...");
      await signIn(emailInput?.value?.trim() || adminEmailAddress, passwordInput?.value || "");
      closeLogin();
      finishReady(true);
    } catch (error) {
      console.error("Admin sign-in failed", error);
      clearSession();
      setLoginStatus(error.message === "NOT_AUTHORIZED" ? "This account is not authorized." : "Incorrect email or password.");
    }
  });

  resetButton?.addEventListener("click", async () => {
    try {
      setLoginStatus("Sending password reset email...");
      await sendPasswordReset(emailInput?.value?.trim() || adminEmailAddress);
      setLoginStatus("Password reset email sent. Check your inbox.");
    } catch (error) {
      console.error("Password reset failed", error);
      setLoginStatus("Could not send the reset email.");
    }
  });

  signOutButton?.addEventListener("click", () => {
    clearSession();
    location.reload();
  });

  dialog?.addEventListener("cancel", (event) => event.preventDefault());

  window.weddingAdminAuth = {
    ready,
    authFetch,
    signOut: () => {
      clearSession();
      location.reload();
    }
  };

  if (!isAdminPage) {
    finishReady(false);
    return;
  }

  verifyStoredSession()
    .then(() => {
      closeLogin();
      finishReady(true);
    })
    .catch(() => {
      clearSession();
      showLogin();
    });
})();
