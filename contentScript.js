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
// End of Helper Functions

var captions_and_timestamps = {};

// Used for downloading, searching captions, and seeking to a time in a video
// Message passing occurs between content.js and popup.js here;

// the callback parameter for .runtime.onMessage looks like:
// (receivedMessage: any, sender: MessageSender, sendResponse: function) => {}
chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  //Populates captions_and_timestamps: called only when youtube video cc is turned on
  if (response.captions != undefined) {
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
  //Populates list of timestamps when user inputs a word/phrase
  else if (response.user_search != undefined) {
    var search_results = [];
    var phrase_results = [];
    for (var caption in captions_and_timestamps) {
      if (caption.includes(response.user_search)) {
        search_results.push(captions_and_timestamps[caption]);
        let caption_split = caption.split(response.user_search);
        let colored_search =
          "<mark border-radius=20%>" + response.user_search + "</mark>";
        let colored_caption =
          caption_split[0] + colored_search + caption_split[1];
        phrase_results.push(colored_caption);
      }
    }
    sendResponse({
      timestamps: search_results,
      phrases: phrase_results,
    });
  }
});
