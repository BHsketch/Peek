// Reference to input box
const phraseBox = document.getElementById("phrase-box");

// Everytime the user stops typing call refreshButtons()
phraseBox.addEventListener("keyup", function (event) {
  event.preventDefault();
  refreshButtons();
});

// Call user_input() by passing in the latest (i.e. post-keyup) input box
function refreshButtons() {
  user_input(phraseBox);
}

//Clear storage for popup contents when tab focus changes
chrome.tabs.onActivated.addListener(function (active_info) {
  chrome.storage.local.clear(function () {
    console.log("clearing storage of popup timestamps");
  });
});

//User search and input
function user_input(input) {
  if (input.value.length == 0) return;
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          user_search: input.value,
        },
        (response) => {
          var timestamps = response.timestamps;
          var phrases = response.phrases;
          console.log(timestamps);
          console.log(phrases);
          var div = document.getElementById("timestamps");
          //Remove timestamp buttons (search results) from popup
          while (div.childElementCount > 2) {
            div.removeChild(div.lastChild);
          }
          //Display message for no search results found
          if (timestamps.length == 0) {
            let failed_message = document.createElement("h4");
            failed_message.innerHTML = "No search results found";
            div.appendChild(failed_message);
          } else {
            //Add current search results to display
            // add_timestamps(div, tabs[0].id, timestamps, phrases);
            chrome.storage.local.set(
              {
                time_keys: timestamps,
                phrases: phrases,
              },
              function () {
                console.log("Storing current popup.html contents");
              }
            );
          }
        }
      );
    }
  );
}
