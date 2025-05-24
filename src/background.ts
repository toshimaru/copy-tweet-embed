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
    throw new Error("Invalid tweet URL format");
  }
  const response = await fetch(
    `${OEMBED_API_URL}?url=${encodeURIComponent(tweetUrl)}`,
    { credentials: "omit" },
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return (await response.json()) as OEmbedResponse;
}

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  const url = tab.url;
  if (!url) return;

  let oembed: OEmbedResponse;
  try {
    oembed = await fetchTweetEmbed(url);
  } catch (error) {
    console.error("Error fetching tweet embed:", error);
    return;
  }

  const tabId = tab.id;
  if (!tabId) return;

  chrome.tabs.sendMessage(tabId, {
    type: "copyTweetEmbedToClipboard",
    html: oembed.html,
  });
});
