let data=document.querySelector['.data'].value;
console.log(data);
const SearchButton = document.querySelector['.Search'];
console.log(data);
SearchButton.onclick = async function (e) {
  let queryOptions = { active: true, currentWindow: true };
  let tab = await chrome.tabs.query(queryOptions);

  chrome.tabs.sendMessage(
    tabId,
    { data: data},
    function (response) {
      console.log(response.status);
    }
  );
};
 