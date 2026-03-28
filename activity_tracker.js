(function () {
  try {
    if (!chrome?.runtime?.sendMessage) return;

    let lastSent = 0;
    const DEBOUNCE_MS = 5000;

    const sendActivity = () => {
      const now = Date.now();
      if (now - lastSent < DEBOUNCE_MS) return;
      lastSent = now;

      try {
        chrome.runtime.sendMessage({
          action: "activityDetected",
          timestamp: now
        }, () => {
          // 🔑 REQUIRED: swallow runtime errors
          if (chrome.runtime.lastError) {
            // silently ignore "context invalidated"
          }
        });
      } catch {
        // ignore hard failures
      }
    };

    ["mousemove", "keydown", "mousedown", "scroll", "touchstart"]
      .forEach(event => {
        document.addEventListener(event, sendActivity, { passive: true });
      });

  } catch {
    // Extension APIs not available
  }
})();