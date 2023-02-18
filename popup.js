const SearchButton = document.querySelector['.Search'];
console.log(data);
SearchButton.onclick = async function (e) {
  let data=document.getElementById('data').value;
  console.log(data);
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
 