console.log("content1");

chrome.storage.local.get(["key"]).then((result) => {
    console.log("Value currently is " + result.key);
    });

const stringSearched = ()=>{
    console.log('sup');
}
