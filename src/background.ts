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
  type: string;
  html: string;
}

async function fetchTweetEmbed(
  tweetUrl: string,
): Promise<OEmbedResponse | null> {
  const response = await fetch(
    `${OEMBED_API_URL}?url=${encodeURIComponent(tweetUrl)}`,
  );
  return (await response.json()) as OEmbedResponse;
}

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  const url = tab.url;
  if (!url) return;
  if (!url.match(/^https:\/\/x\.com\/.+\/status\/\d+/)) return;

  let oembed;
  try {
    oembed = await fetchTweetEmbed(url);
    if (!oembed || !oembed.html) return;
  } catch (error) {
    console.error("Error fetching tweet embed:", error);
    return;
  }

  const tabId = tab.id;
  if (!tabId) return;

  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      chrome.runtime.onMessage.addListener((msg: TweetEmbedMessage) => {
        if (msg.type === "copyTweetEmbedToClipboard") {
          navigator.clipboard.writeText(msg.html);
        }
      });
    },
  });

  chrome.tabs.sendMessage(tabId, {
    type: "copyTweetEmbedToClipboard",
    html: oembed.html,
  });
});
