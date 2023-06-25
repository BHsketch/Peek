// Helper Functions to process captions
function get_timestamp(tag) {
  return tag.attributes.item(0).nodeValue;
}
function get_caption(tag) {
  return tag.textContent
    .toLowerCase()
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .replace("&#39", "'")
    .replace(";", "")
    .trim();
}
function populate_captions(response) {
  let tags = Array.prototype.slice.call(response.getElementsByTagName("text"));
  let captions = tags.map(get_caption);
  let timestamps = tags.map(get_timestamp);
  let captions_and_timestamps = {};
  for (var i = 0; i < captions.length; i++) {
    captions_and_timestamps[captions[i]] = timestamps[i];
  }
  return captions_and_timestamps;
}
function convert_time(input){
  let hours = Math.floor(input/3600);
  let minutes = Math.floor((input%3600)/60);
  let seconds = Math.floor((input%60));

  console.log(hours);
  console.log(minutes);
  console.log(seconds);

  let returnval = hours.toString() + ":" + minutes.toString() + ":" + seconds.toString();
  return returnval;
}
function timeoutfunc(){
  setTimeout(function() {
    calculateOffsetHeight();
  }, 2000);
}
function calculateOffsetHeight(){
  let video = document.getElementsByClassName('html5-main-video')[0];
  offsetreturnval = 0.2*(video.offsetHeight);
}
function calculateRatio(timestamps, durationinseconds, i){
    let ratio = timestamps[i] / durationinseconds;
    ratio = ratio * 100;
    let ratio2 = ratio/100;

    let listofchapterelements = document.getElementsByClassName('ytp-chapter-hover-container');
    let listofpercentages = [];
    let sum = 0;
    let sum2 = 0;

    for(let i = 0; i< listofchapterelements.length; i++)
    {
      sum += listofchapterelements[i].offsetWidth;
    }

    console.log("sum: " + sum);

    for(let i = 0; i< listofchapterelements.length; i++)
    {
      listofpercentages.push((listofchapterelements[i].offsetWidth) / sum);
    }

    for(let i = 0; i< listofpercentages.length; i++)
    {
      sum2 += listofpercentages[i];
      if(sum2 >= ratio2)
      {
        return ((ratio2*sum) + Math.floor((i-1)*2.1));
      }
    }

    console.log(ratio);
}
// End of Helper Functions

var vid_url;
var captions_and_timestamps = {};
var offsetreturnval;

// the callback parameter for .runtime.onMessage looks like:
// (receivedMessage: any, sender: MessageSender, sendResponse: function) => {}
chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  // Populates captions_and_timestamps: called only when youtube video cc is turned on
  // The following if condition triggers from the sendMessage of background.js
  if (response.captions != undefined) {
    //console.log("new web request");
    removeAllHighlights();
    fetch(response.captions)
      .then((response) => response.text())
      .then((responseText) => {
        captions_and_timestamps = populate_captions(
          new DOMParser().parseFromString(responseText, "text/xml")
        );
        const youtube_title = document.getElementsByClassName(
          "title style-scope ytd-video-primary-info-renderer"
        )[0].innerText;
        sendResponse({
          status: "Captions received",
          youtube_title: youtube_title,
        });
      })
      .catch((error) => {
        console.error("Error fetching captions:", error);
      });
  }
  // Populates list of timestamps when user inputs a word/phrase
  // The following if condition triggers from the sendMessage() of popup.js
  else if (response.user_search != undefined) {
    var search_results = [];
    var phrase_results = [];

    //calls appropriate functions to add or remove(existing) highlights depending on
    //if the "keyup" event results in an empty or non-empty string
    if(response.user_search != "")
    {
      for (var caption in captions_and_timestamps) {
        if (caption.includes(response.user_search)) {
          search_results.push(captions_and_timestamps[caption]);
          let caption_split = caption.split(response.user_search);
          let colored_search =
            "<mark border-radius=20% style= \"background-color:turquoise; color: black;\" >" + response.user_search + "</mark>";
          let colored_caption =
            caption_split[0] + colored_search + caption_split[1];
          phrase_results.push(colored_caption);
        }
      }

      console.log(search_results);
      changeDOMtimeline(search_results, phrase_results);
    }else{
      removeAllHighlights();
    }
    
    sendResponse({
      timestamps: search_results,
      phrases: phrase_results,
    });
  }else if(response.url != undefined){
    removeAllHighlights();
    vid_url = response.url;
  }
});

function changeDOMtimeline(timestamps, phrases) {
  let durationvid =
    document.getElementsByClassName("ytp-time-duration")[0].innerHTML;
  let durationsplit = durationvid.split(":");
  let i;

  for (i = 0; i < durationsplit.length; i++) {
    durationsplit[i] = Number(durationsplit[i]);
  }
  //duration split just has a bunch of numbers now

  i = 0;
  let j = 0;
  let durationinseconds = 0;

  for (i = 0; i < durationsplit.length; i++) {
    durationinseconds +=
      durationsplit[durationsplit.length - 1 - i] * Math.pow(60, i);
  }

  console.log("duration in seconds: " + durationinseconds);

  //now we have the total duration of the video

  let parent = document.getElementsByClassName("ytp-timed-markers-container")[0];

  let len;
  len = document.getElementsByClassName("highlights-wrapper");
  let wrapper;

  if(len.length == 0)
  {
    wrapper = document.createElement("div");
    wrapper.className = "highlights-wrapper";
    parent.appendChild(wrapper);
    console.log("wrapper created");
  }else{
    wrapper = len[0];
    console.log("wrapper assigned");
  }

  wrapper.innerHTML = "";
  
  calculateOffsetHeight();

  for (i = 0; i < timestamps.length; i++) {
    console.log("iteration" + i);
  
    // let ratio = timestamps[i] / durationinseconds;
    // ratio = ratio * 100;
    // console.log(ratio);

    let highlightleftoffset = calculateRatio(timestamps, durationinseconds, i);
    //ratio in percentage
    
    let childwrapper = document.createElement("div");
    childwrapper.className = "highlightPhraseWrapper";
    childwrapper.style.position = "absolute";
    childwrapper.style.height = "100%";
    childwrapper.style.zIndex = "100"
    childwrapper.style.left = highlightleftoffset + "px";
    childwrapper.style.width = "2px";
    childwrapper.style.overflow = "visible";
    childwrapper.style.padding = "0px";

    //calculating time stamps in hours:minutes:seconds:
    let displaytime = convert_time(timestamps[i]);
    timeoutfunc();

    let phrasechild = document.createElement("div");
    phrasechild.className = "ytp-highlight-phrase";
    phrasechild.style.position = "absolute";
    phrasechild.style.height = "auto";
    phrasechild.style.display = "inline-block";
    //phrasechild.style.setProperty('height', '15px', 'important');
    phrasechild.style.width = "250px";
    phrasechild.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    phrasechild.style.borderRadius = "7px";
    phrasechild.style.paddingLeft = "8px";
    phrasechild.style.paddingTop = "5px";
    phrasechild.style.paddingBottom = "3px";
    phrasechild.style.color = "white";
    phrasechild.style.fontFamily = "Monospace";
    phrasechild.style.zIndex = "100"
    phrasechild.style.left = "-125px"
    phrasechild.style.bottom = offsetreturnval.toString() + "px";
    phrasechild.style.visibility = "hidden";
    phrasechild.innerHTML = displaytime + " | " + phrases[i];

    // let timelink = document.createElement("a");
    // timelink.className = "highlight-time-link";
    // timelink.style.position = "absolute";
    // timelink.style.height = "100%";
    // timelink.style.width = "2px";
    // timelink.style.zIndex = "100"
    // let urlsplit = vid_url.split("&t=");
    // timelink.href = urlsplit[0] + "&t=" + (Math.floor(timestamps[i])).toString() + "s";
    // timelink.onclick = "window.open(this.href,'_blank');return false;";


    let child = document.createElement("div");
    child.className = "ytp-highlight-progress";
    child.style.backgroundColor = "turquoise";
    child.style.position = "absolute";
    child.style.height = "100%";
    child.style.zIndex = "100"
    child.style.right = "2px"
    child.style.width = "2px";

    // child.addEventListener('click', function() {
    //   window.location.href = urlsplit[0] + 't=' + (Math.floor(timestamps[i])).toString() + 's';
    // });

    child.addEventListener('mouseover', function() {
      // Change the visibility of the phrase to visible
      phrasechild.style.visibility = 'visible';

      calculateOffsetHeight();
      phrasechild.style.bottom = offsetreturnval.toString() + "px";
    });

    child.addEventListener('mouseout', function() {
      // Change the visibility of element1 to hidden
      phrasechild.style.visibility = 'hidden';
    });

    let fullscreenbutton = document.getElementsByClassName('ytp-fullscreen-button')[0];

    // fullscreenbutton.addEventListener('click', function () {
    //   timeoutfunc();
    //   phrasechild.style.bottom = offsetreturnval.toString() + "px";
    // })

    childwrapper.appendChild(phrasechild);
    childwrapper.appendChild(child);
    
    wrapper.appendChild(childwrapper);
  }
}

//removes existing highlights
function removeAllHighlights()
{
  let parent = document.getElementsByClassName("ytp-timed-markers-container")[0];

  let len;
  len = document.getElementsByClassName("highlights-wrapper");
  let wrapper;

  if(len.length == 0)
  {
    wrapper = document.createElement("div");
    wrapper.className = "highlights-wrapper";
    parent.appendChild(wrapper);
    console.log("wrapper created");
  }else{
    wrapper = len[0];
    console.log("wrapper assigned");
  }

  wrapper.innerHTML = "";

  console.log("highlights deleted");
}