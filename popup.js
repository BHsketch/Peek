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

//User search and input
function user_input(input) {
  // Don't execute the rest of the function if textbox empty
  
  ///if (input.value.length == 0) return;

  // tabs.query() takes a queryInfo object and a (result: Tab[]) => {} type callback function
  // Documentation link: https://developer.chrome.com/docs/extensions/reference/tabs/#method-query
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      // format: .tabs.sendMessage(tabId, msg, options?, callback?)
      // tabs.sendMessage() sends a single message to the content script(s) in the specified tab,
      // with an optional callback to run when a response is sent back.
      // Parallely, the runtime.onMessage event is fired in each content script running
      // in the specified tab for the current extension.
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          user_search: input.value,
        },
        (response) => {
          const timestamps = response.timestamps;
          const phrases = response.phrases;
          console.log(timestamps);
          console.log(phrases);

          const div = document.getElementById("timestamps");

          // Removes the "No search results found" message if a matching string is further found
          while (div.childElementCount > 1) {
            div.removeChild(div.lastChild);
          }
          // Display message for no search results found
          if (timestamps.length == 0 && div.childElementCount < 2) {
            let failed_message = document.createElement("h4");
            failed_message.innerHTML = "No search results found";
            div.appendChild(failed_message);
          }
        }
      );
    }
  );
}
