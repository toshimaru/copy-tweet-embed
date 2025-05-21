interface TweetEmbedMessage {
  type: "copyTweetEmbedToClipboard";
  html: string;
}

function createToast(): HTMLElement {
  const toast = document.createElement('div');
  
  // Create container
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '8px';
  
  // Create checkmark icon
  const icon = document.createElement('div');
  icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#2CCD48"/>
    <path d="M8.33341 12.6434L15.9934 4.98251L17.1727 6.16084L8.33341 15L3.03009 9.69667L4.20842 8.51834L8.33341 12.6434Z" fill="white"/>
  </svg>`;
  
  // Add text
  const text = document.createElement('span');
  text.innerText = 'Copied to clipboard';
  text.style.fontWeight = '500';
  
  // Append elements
  container.appendChild(icon);
  container.appendChild(text);
  toast.appendChild(container);
  
  // Style toast
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(29, 29, 29, 0.9)';
  toast.style.color = 'white';
  toast.style.padding = '10px 16px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  toast.style.zIndex = '10000';
  toast.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
  toast.style.fontSize = '14px';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease-in-out';
  
  return toast;
}

function showToast() {
  // Remove existing toast if present
  const existingToast = document.querySelector(".copy-tweet-toast");
  if (existingToast) {
    document.body.removeChild(existingToast);
  }

  const toast = createToast();
  toast.classList.add("copy-tweet-toast");
  document.body.appendChild(toast);

  // Trigger a reflow to enable the transition
  void toast.offsetWidth;

  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.addEventListener("transitionend", () => {
      document.body.removeChild(toast);
    });
  }, 3000);
}

chrome.runtime.onMessage.addListener(async (msg: TweetEmbedMessage) => {
  if (msg.type === "copyTweetEmbedToClipboard") {
    await navigator.clipboard.writeText(msg.html);
    showToast();
  }
});
