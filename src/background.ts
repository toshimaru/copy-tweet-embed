chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  const tabId: number | undefined = tab.id;
  if (!tabId) return;

  chrome.scripting
    .executeScript({
      target: { tabId },
      func: () => {
        // Write the current page's URL to the clipboard
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => alert(`URL copied: ${window.location.href}`))
          .catch((err: Error) => alert(`Failed to copy URL: ${err.message}`));
      },
    })
    .catch((err: Error) => {
      console.error("Script injection failed:", err);
    });
});
