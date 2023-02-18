const SearchButton = document.getElementById('Submit');

console.log("popup1");

SearchButton.addEventListener("click", (tabId, tab)=>{

console.log("popup2");

let stringdata = document.getElementById("data").value;

chrome.storage.local.set({ key: stringdata}).then(() => {
  console.log("Value is set to " + value);
});
  
})
