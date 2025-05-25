interface CopyTweetEmbedMessage {
  type: "copyTweetEmbedToClipboard";
  html: string;
}

interface ErrorMessage {
  type: "showErrorMessage";
  message: string;
}

type TweetEmbedMessage = CopyTweetEmbedMessage | ErrorMessage;

type StyleMap = Partial<CSSStyleDeclaration>;

const SUCCESS_ICON_SVG = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="10" fill="#2CCD48"/>
  <path d="M8.33341 12.6434L15.9934 4.98251L17.1727 6.16084L8.33341 15L3.03009 9.69667L4.20842 8.51834L8.33341 12.6434Z" fill="white"/>
</svg>
`;
const ERROR_ICON_SVG = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="10" fill="#E53935"/>
  <path d="M13.0049 7.29438L12.7077 7.00028L10.0005 9.70743L7.29334 7.00028L6.99609 7.29438L9.70324 10.0015L6.99609 12.7087L7.29334 13.0028L10.0005 10.2956L12.7077 13.0028L13.0049 12.7087L10.2978 10.0015L13.0049 7.29438Z" fill="white" stroke="white"/>
</svg>
`;
const TOAST_STYLES: StyleMap = {
  position: "fixed",
  bottom: "24px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "rgba(29, 29, 29, 0.9)",
  color: "white",
  padding: "10px 16px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  zIndex: "10000",
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  fontSize: "14px",
  opacity: "0",
  transition: "opacity 0.3s ease-in-out",
};

/**
 * Applies a set of CSS styles to an HTML element.
 *
 * @param {HTMLElement} el - The HTML element to which the styles will be applied.
 * @param {StyleMap} styles - An object representing CSS properties and their values.
 */
function setStyles(el: HTMLElement, styles: StyleMap) {
  Object.assign(el.style, styles);
}

function createToast(message: string, isError = false): HTMLElement {
  const toast = document.createElement("div");

  // Create container
  const container = document.createElement("div");
  setStyles(container, {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });

  // Create icon
  const icon = document.createElement("div");
  icon.innerHTML = isError ? ERROR_ICON_SVG : SUCCESS_ICON_SVG;

  // Add text
  const text = document.createElement("span");
  text.innerText = message;
  setStyles(text, { fontWeight: "500" });

  // Append elements
  container.appendChild(icon);
  container.appendChild(text);
  toast.appendChild(container);

  // Style toast
  setStyles(toast, TOAST_STYLES);
  if (isError) {
    setStyles(toast, { backgroundColor: "rgba(210, 50, 50, 0.9)" });
  }

  return toast;
}

function showToast(message: string, isError = false) {
  // Remove existing toast if present
  const existingToast = document.querySelector(".copy-tweet-toast");
  if (existingToast) {
    document.body.removeChild(existingToast);
  }

  const toast = createToast(message, isError);
  toast.classList.add("copy-tweet-toast");
  document.body.appendChild(toast);

  // Trigger a reflow to enable the transition
  void toast.offsetWidth;

  setStyles(toast, { opacity: "1" });
  setTimeout(() => {
    setStyles(toast, { opacity: "0" });
    toast.addEventListener("transitionend", () => {
      document.body.removeChild(toast);
    });
  }, 3000);
}

chrome.runtime.onMessage.addListener(async (msg: TweetEmbedMessage) => {
  switch (msg.type) {
    case "copyTweetEmbedToClipboard":
      try {
        await navigator.clipboard.writeText(msg.html);
        showToast("Copied to clipboard");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        showToast("Failed to copy to clipboard", true);
      }
      break;
    case "showErrorMessage":
      showToast(msg.message, true);
      break;
  }
});
