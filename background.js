//Gets captions_url from network_log then sends over to content script for downloading + processing
var prev_captions_url = "";

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (
      details.url == undefined ||
      details.initiator != "https://www.youtube.com"
    )
      return;
    var captions_url = details.url.replace("fmt=json3", "fmt=srv1");
    //Send the captions URL to the content script for parsing
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        if (prev_captions_url === captions_url) {
          chrome.browserAction.enable(tabs[0].id);
          return;
        }
        prev_captions_url = captions_url;
        console.log("new web request in background.js");
        chrome.tabs.sendMessage(tabs[0].id, {
          captions: captions_url,
        });
      }
    );
  },
  {
    urls: ["https://www.youtube.com/api/timedtext?*"],
  }
);


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { message: 'URLChanged', url: changeInfo.url });
  }
});