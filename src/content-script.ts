interface TweetEmbedMessage {
  type: "copyTweetEmbedToClipboard";
  html: string;
}

chrome.runtime.onMessage.addListener(async (msg: TweetEmbedMessage) => {
  if (msg.type === "copyTweetEmbedToClipboard") {
    await navigator.clipboard.writeText(msg.html);
  }
});
