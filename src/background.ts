const OEMBED_API_URL = "https://publish.twitter.com/oembed";

interface OEmbedResponse {
  version: string;
  type: "photo" | "video" | "link" | "rich";
  html: string;
  url: string;
  author_name: string;
  author_url: string;
}

interface TweetEmbedMessage {
  type: "copyTweetEmbedToClipboard";
  html: string;
}

async function fetchTweetEmbed(tweetUrl: string): Promise<OEmbedResponse> {
  const response = await fetch(
    `${OEMBED_API_URL}?url=${encodeURIComponent(tweetUrl)}`,
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return (await response.json()) as OEmbedResponse;
}

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  const url = tab.url;
  if (!url) return;
  if (!url.match(/^https:\/\/x\.com\/.+\/status\/\d+/)) return;

  let oembed;
  try {
    oembed = await fetchTweetEmbed(url);
  } catch (error) {
    console.error("Error fetching tweet embed:", error);
    return;
  }

  const tabId = tab.id;
  if (!tabId) return;

  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // TODO: Move to content-script.js
      // ref. https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
      chrome.runtime.onMessage.addListener(async (msg: TweetEmbedMessage) => {
        if (msg.type === "copyTweetEmbedToClipboard") {
          await navigator.clipboard.writeText(msg.html);
        }
      });
    },
  });

  chrome.tabs.sendMessage(tabId, {
    type: "copyTweetEmbedToClipboard",
    html: oembed.html,
  });
});
