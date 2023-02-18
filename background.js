chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  try {
    if (request.key != "password") {
      sendResponse({ status: "failure" });
    }
    sendResponse({ status: "success" });
  } catch (err) {
    sendResponse({ status: "failure" });
  }
});
