const contractAddress = 'ct_fwL1A4AoXUJVwCch7QaCMy4ajNDghhMUB3LeTtdRTtPxhWi2H';
var client = null;
var memeArray = [];
var memesLength = 0;

//Function that orders memes so that the meme with the most votes is on top.
function compare(a,b) {
  if (a.votes > b.votes)
    return -1;
  if (a.votes < b.votes)
    return 1;
  return 0;
}

function renderMemes() {
  //Order the memes array so that the meme with the most objects is on top
  memeArray = memeArray.sort(compare);
  var template = $('#template').html();
  Mustache.parse(template);   //optional, speeds up future uses
  var rendered = Mustache.render(template, {memeArray});
  $('#memeBody').html(rendered);
}

async function callStatic(func, args, types) {
  const calledGet = await client.contractCallStatic(contractAddress,'sophia-address', func, {args}).catch(e => console.error(e));
  const decodedGet = await client.contractDecodeData(types,calledGet.result.returnValue).catch(e => console.error(e));
  return decodedGet;
}

window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();

  const getMemesLength = await callStatic('getMemesLength','()','int');
  memesLength = getMemesLength.value;

  for (let i = 1; i < memesLength; i++) {

    //Make the call to the blockchain to get all relevant information on the meme
    const meme = await callStatic('getMeme',`(${i})`,'(address, string, string, int)');

    //Create a new element with all the relevant information for the meme and push the new element into the array with all memes
    memeArray.push({
      creatorName: meme.value[2].value,
      memeUrl: meme.value[1].value,
      index: i,
      votes: meme.value[3].value,
    })
  }

  //Display the memes
  renderMemes();
  $("#loader").hide();
});

//If someone clicks to vote on a meme, get the input and execute the voteCall
jQuery("#memeBody").on("click", ".voteBtn", async function(event){
  let value = $(this).siblings('input').val();
  let index = event.target.id;
  //Hide the loading animation after async calls return a value
  const foundIndex = memeArray.findIndex(meme => meme.index == event.target.id);
  //console.log(foundIndex);
  memeArray[foundIndex].votes += parseInt(value, 10);
  //update and render memes
  renderMemes();
});

//If someone clicks to register a meme, get the input and execute the registerCall
$('#registerBtn').click(async function(){
  $("#loader").show();
  var name = ($('#regName').val()),
      url = ($('#regUrl').val());

  memeArray.push({
    creatorName: name,
    memeUrl: url,
    index: memesLength,
    votes: 0
  })
  //update and render meme
  renderMemes();
  $("#loader").hide();
});
