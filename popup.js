//Gets captions_url from network_log then sends over to content script for downloading + processing
var prev_captions_url = "";
let highlights = [];
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

          //processing in js

          // let jscode = "progresscontainer = document.getElementsByClassName('ytp-progress-list')[0]";
          // jscode+="progresscontainer.innerHTML+='<div class=\"ytp-highlight-progress\" style=\"background-color:turquoise; position:absolute; height:100%; width:30px; left:\"300px\"></div>'";

          // chrome.tabs.executeScript( 
          // { 
          //   code:jscode
          // }, 
          // function() { 
          // console.log("JavaScript executed!"); 
          // } 
          // ); 

          let durationvid = (document.getElementsByClassName('ytp-time-duration'))[0].innerHTML
          let durationsplit = durationvid.split(':')
          let i;

          for(i=0; i<durationsplit.length; i++)
          {
              durationsplit[i] = Number(durationsplit[i]);
          }
          //duration split just has a bunch of numbers now

          i=0;
          let j=0;
          let durationinseconds = 0;

          for(i=0; i<durationsplit.length; i++)
          {
          durationinseconds += (durationsplit[durationsplit.length - 1 - i])*(Math.pow(60, i));
          }

          //now we have the total duration of the video

          for(i=0; i<timestamps.length; i++)
          {
          timestamps[i] = Math.floor(timestamps[i]);
          let ratio = (timestamps[i])/durationinseconds;
          ratio = ratio*100;
          //ratio in percentage
          //progresscontainer = document.getElementsByClassName('ytp-progress-list')[0];
          //progresscontainer.innerHTML+='<div class=\"ytp-highlight-progress\" style=\"background-color:turquoise; position:absolute; height:100%; width:10px; left:' + toString(ratio) + '%\"></div>';

          let child = document.createElement('div');
          child.className = 'ytp-highlight-progress';
          child.style.backgroundColor = "turquoise";
          child.style.position = absolute;
          child.style.position = "absolute";
          child.style.height = "100%";
          child.style.left = ratio;
          child.style.width = "10px";
          let parent = document.getElementsByClassName('ytp-progress-list')[0];
          parent.appendChild(child);
          }

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
// document.getElementById('phrase-box')
//     .addEventListener('search', function() {
//       let k;
//       for(k=0; k<highlights.length; k++)
//       {
//         highlights[k].remove();
//       }
//       highlights = [];
//     });