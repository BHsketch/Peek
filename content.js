chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const {type, data} = obj;

    stringSearched();
});

const stringSearched = ()=>{

}

document.get