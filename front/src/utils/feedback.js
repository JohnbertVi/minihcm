import toast from "react-hot-toast";

let audioContext;

function tone({ frequency = 660, duration = 0.08, gain = 0.025 } = {}) {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    volume.gain.value = gain;

    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Browsers can block audio before user interaction. Toasts still work.
  }
}

export function getErrorMessage(error) {
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

  return error?.response?.data?.message || error?.message || "Something went wrong.";
}

function show(kind, message, options = {}) {
  const frequencies = {
    success: 720,
    error: 220,
    loading: 440,
    info: 540,
  };

  tone({ frequency: frequencies[kind] || 540 });

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
