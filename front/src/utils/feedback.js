import toast from "react-hot-toast";

const SOUNDS = {
  success: "/toast-success.wav",
  error: "/toast-error.wav",
  info: "/toast-info.wav",
  loading: "/toast-loading.wav",
};

let audioContext;
let unlocked = false;

function unlockAudio() {
  if (unlocked || typeof window === "undefined") return;

  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    unlocked = true;
  } catch {
    // Audio may still be blocked. Toasts still work silently.
  }
}

function playSound(kind) {
  if (typeof window === "undefined") return;

  unlockAudio();

  try {
    const audio = new Audio(SOUNDS[kind] || SOUNDS.info);
    audio.volume = 0.25;
    audio.play().catch(() => {
      // Autoplay blocked — ignore.
    });
  } catch {
    // Audio unsupported.
  }
}

const FIREBASE_ERROR_MESSAGES = {
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/invalid-login-credentials": "Invalid email or password. Please try again.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists. Please sign in instead.",
  "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/network-request-failed": "Network error. Please check your internet connection and try again.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
  "auth/requires-recent-login": "Please sign in again to complete this action.",
  "auth/invalid-password": "Invalid password. Please try again.",
  "auth/missing-password": "Please enter your password.",
  "auth/missing-email": "Please enter your email address.",
};

function getFirebaseErrorMessage(error) {
  const code = error?.code;
  const message = error?.message || "";

  if (code && FIREBASE_ERROR_MESSAGES[code]) {
    return FIREBASE_ERROR_MESSAGES[code];
  }

  // Fallback pattern matching for Firebase error codes embedded in messages
  for (const [firebaseCode, friendlyMessage] of Object.entries(FIREBASE_ERROR_MESSAGES)) {
    if (message.includes(firebaseCode)) {
      return friendlyMessage;
    }
  }

  if (code?.startsWith("auth/")) {
    return "Authentication failed. Please check your details and try again.";
  }

  return null;
}

export function getErrorMessage(error) {
  // Handle Firebase auth errors first
  const firebaseMessage = getFirebaseErrorMessage(error);
  if (firebaseMessage) {
    return firebaseMessage;
  }

  const status = error?.response?.status;

  if (status === 502) {
    return "Backend is not reachable. Start the Express server, then try again.";
  }

  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
    return "Network request failed. Check that the backend server is running.";
  }

  if (status === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have access to this admin action.";
  }

  if (status === 404) {
    return "The requested resource was not found.";
  }

  if (status === 422) {
    return error?.response?.data?.message || "Invalid request. Please check your input.";
  }

  if (status >= 500) {
    return "Something went wrong on our server. Please try again later.";
  }

  return error?.response?.data?.message || error?.message || "Something went wrong.";
}

function show(kind, message, options = {}) {
  playSound(kind);

  if (kind === "success") {
    return toast.success(message, options);
  }

  if (kind === "error") {
    return toast.error(message, options);
  }

  if (kind === "loading") {
    return toast.loading(message, options);
  }

  return toast(message, {
    icon: "i",
    ...options,
  });
}

export const notify = {
  success: (message, options) => show("success", message, options),
  error: (message, options) => show("error", message, options),
  info: (message, options) => show("info", message, options),
  loading: (message, options) => show("loading", message, options),
  dismiss: toast.dismiss,
  promise: toast.promise,
};
