//Gets captions_url from network_log then sends over to content script for downloading + processing
var prev_captions_url = "";
chrome.webRequest.onCompleted.addListener(
  function (details) {
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
      function (tabs) {
        if (prev_captions_url === captions_url) {
          chrome.browserAction.enable(tabs[0].id);
          return;
        }
        prev_captions_url = captions_url;
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            captions: captions_url,
          },
        );
      }
    );
  },
  {
    urls: ["https://www.youtube.com/api/timedtext?*"],
  }
);

//User search and input
function user_input(input) {
  if (input.value.length == 0) return;
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          user_search: input.value,
        },
        function (response) {
          var timestamps = response.timestamps;
          var phrases = response.phrases;
          var div = document.getElementById("timestamps");
          console.log(timestamps);
          console.log(phrases);

          while (div.childElementCount > 2) {
            div.removeChild(div.lastChild);
        }
          //Display message for no search results found
          if (timestamps.length == 0) {
            let failed_message = document.createElement("h4");
            failed_message.innerHTML = "No search results found";
            div.appendChild(failed_message);
          }
        }
      );
    }
  );
}
function refreshButtons() {
  user_input(document.getElementById("phrase-box"));
}
document.getElementById("phrase-box").addEventListener("keyup", function (event) {
    event.preventDefault();
    refreshButtons();
  });
