const OEMBED_API_URL = "https://publish.twitter.com/oembed";

interface OEmbedResponse {
  version: string;
  type: "photo" | "video" | "link" | "rich";
  html: string;
  url: string;
  author_name: string;
  author_url: string;
}

async function fetchTweetEmbed(tweetUrl: string): Promise<OEmbedResponse> {
  if (!tweetUrl.match(/^https:\/\/x\.com\/.+\/status\/\d+/)) {
    throw new Error("Invalid tweet URL format.");
  }
  const response = await fetch(
    `${OEMBED_API_URL}?url=${encodeURIComponent(tweetUrl)}`,
    {
      method: "GET",
      credentials: "omit",
      headers: {
        Accept: "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}.`);
  }
  return (await response.json()) as OEmbedResponse;
}

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  const url = tab.url;
  if (!url) return;

  const tabId = tab.id;
  if (!tabId) return;

  try {
    const oembed = await fetchTweetEmbed(url);
    chrome.tabs.sendMessage(tabId, {
      type: "copyTweetEmbedToClipboard",
      html: oembed.html,
    });
  } catch (error) {
    let message = "Failed to fetch tweet embed.";
    if (error instanceof Error) {
      message += `\nError: ${error.message}`;
    }
    console.error(error);
    chrome.tabs.sendMessage(tabId, {
      type: "showErrorMessage",
      message,
    });
  }
});
