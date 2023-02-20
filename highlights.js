

let timestamps = JSON.parse((document.getElementsByClassName('extraElement')[0]).textContent);

console.log("timestamps:");
console.log(timestamps);

let durationvid = (document.getElementsByClassName('ytp-time-duration'))[0].innerHTML;
let durationsplit = durationvid.split(':');
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

console.log(durationinseconds);

//now we have the total duration of the video

for(i=0; i<timestamps.length; i++)
{
    console.log("iteration" + i);
    timestamps[i] = Math.floor(timestamps[i]);
    let ratio = (timestamps[i])/durationinseconds;
    ratio = Math.floor(ratio*100);
    console.log(ratio);
    //ratio in percentage
    //progresscontainer = document.getElementsByClassName('ytp-progress-list')[0];
    //progresscontainer.innerHTML+='<div class=\"ytp-highlight-progress\" style=\"background-color:turquoise; position:absolute; height:100%; width:10px; left:' + toString(ratio) + '%\"></div>';

    let parent = document.getElementsByClassName('ytp-progress-list')[0];
    let child = document.createElement('div');
    child.className = 'ytp-highlight-progress';
    child.style.backgroundColor = "turquoise";
    child.style.position = "absolute";
    child.style.height = "100%";
    child.style.left = ratio + '%';
    child.style.width = "1px";
    
    parent.appendChild(child);
}