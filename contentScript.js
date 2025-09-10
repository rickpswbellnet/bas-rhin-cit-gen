//console.log("Starting contentScript.js");

let givNames1 = "";
let surname1 = "";
let eventType = "";
let actDateStr = "";
let actPage = "";
let actNo = "";
let givNames2 = "";
let surname2 = "";
let openNamedRef = "";
let closeRef = "</ref>";
document.addEventListener('DOMContentLoaded', documentEvents, false);

document.getElementById('build-citation').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        //console.log("Build Citation button clicked");
		const tab = tabs[0];
        
        function getBasRhinCitElems() {
            //console.log("Starting getBasRhinCitElems func");
			const currentURL = window.location.href;
			function getCurrentDateFormatted() {
			  const today = new Date();
			  const day = today.getDate();
			  const month = today.toLocaleString('en-US', { month: 'long' });
			  const year = today.getFullYear();
			  return `${day} ${month} ${year}`;
			}
            //console.log("Starting curdate processing");
			const formattedDate = getCurrentDateFormatted();
            //console.log("Ending curdate processing");
			const texte = document.getElementById("texte");
            //console.log("Starting lieu/periods processing");
			let lieuText = 'Lieu: ';
			let periodsText = 'Périodes: ';
			if (texte) {
			  const texteh3s = texte.getElementsByTagName("h3");
			  if (texteh3s.length > 0) {
				for (let i = 0; i < texteh3s.length; i++) {
				  const texteh3Anchors = texteh3s[i].getElementsByTagName("a");
				  if (texteh3Anchors.length > 0) {
					for (let j = 0; j < texteh3Anchors.length; j++) {
					  if (texteh3s[i].textContent.substr(0, 4) === 'Lieu') {
						if (j === 0) {
						  lieuText += texteh3Anchors[j].textContent;
						} else {
						  lieuText += ' > '+texteh3Anchors[j].textContent;
						}
					  }
					  if (texteh3s[i].textContent.substr(0, 3) === 'Pér') {
						if (j === 0) {
						  periodsText += texteh3Anchors[j].textContent;
						} else {
						  periodsText += '; '+texteh3Anchors[j].textContent;
						}
					  }
					}
				  }
				}
			  } else {
				//console.log("No h3s found within texte");
			  }
			} else {
			  //console.log("texte not found");
			}
            //console.log("Ending lieu/periods processing");
            //console.log("Starting image no processing");
			const imageNo = document.getElementsByClassName('pagination-min');
			const imageMax = document.getElementsByClassName('pagination-max');
			const ulRattachementList = document.querySelectorAll('ul.rattachement');
			const ulRattachementAList = ulRattachementList[0].getElementsByTagName('a');
			const titreRubriques = document.getElementsByClassName('titre_rubrique');
            //console.log(currentURL, formattedDate, lieuText, periodsText);
            //console.log("Starting citPart processing");
			let citPart1 = "";
			let citPart2 = "";
			let citPart3 = "";
			let citPart = new Array(3).fill("");
			citPart[0] = '"Registres paroissiaux et documents d\'état civil," images, des Archives départementales du Bas-Rhin (['+currentURL+' image] : accessed '+formattedDate+'), '+lieuText+', '+periodsText;
            //console.log("citPart[0]="+citPart[0]);
			citPart[1] = ', image '+imageNo[0].textContent+' of '+imageMax[0].textContent+'; '+ulRattachementAList[0].textContent+' > '+ulRattachementAList[1].textContent+' > '+titreRubriques[0].textContent.trim()+'.';
            //console.log("citPart[1]="+citPart[1]);

			// https://developer.chrome.com/docs/extensions/mv3/messaging/
			(async () => {
				const response = await chrome.runtime.sendMessage({info: citPart});
				// do something with response here, not outside the function
				//console.log(response);
			})();
            //console.log("Ending getBasRhinCitElems func");
        };

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getBasRhinCitElems,
            //			files: ['getBasRhinCitElems.js'],  // Call external file instead
        }).then(() => console.log('Injected a function!'));
    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log(sender.tab ?
    //            "from a content script: " + sender.tab.url :
    //            "from the extension");
    let resp = request.info;
    if (resp) {
		citPart1 = resp[0];
		citPart3 = resp[1];
        document.getElementById("result").innerText = openNamedRef+citPart1+citPart2+citPart3+closeRef;
		navigator.clipboard.writeText(openNamedRef+citPart1+citPart2+citPart3+closeRef).then(
			() => {
				//console.log("Clipboard write successful");
			},
			() => {
				//console.log("Clipboard write failed");
			},
		);
//		document.getElementById("result").select();
//		document.execCommand('copy');
        sendResponse({farewell: "thanks for sending! goodbye"});
    }
  }
);

function myAction(inputs) { 
    //console.log("Input Values:");
	for (let i = 0; i < inputs.length; i++) {
		//console.log(inputs[i].name + ": " + inputs[i].value);
		if (inputs[i].name === 'eventType') {
			if (inputs[i].checked) {
				eventType = inputs[i].value;
			}
		} else {
			switch (inputs[i].name) {
				case "givNames1":
					givNames1 = inputs[i].value;
					break;
				case "surname1":
					surname1 = inputs[i].value;
					break;
				case "actDateStr":
					actDateStr = inputs[i].value;
					break;
				case "actPage":
					actPage = inputs[i].value;
					break;
				case "actNo":
					actNo = inputs[i].value;
					break;
				case "givNames2":
					givNames2 = inputs[i].value;
					break;
				case "surname2":
					surname2 = inputs[i].value;
					break;
				default:
					console.log("    Unknown Input: " + inputs[i].name + ": " + inputs[i].value);
			}
		}
	}
	let eventTypeAbbrev = '';
	if (eventType === 'Death') {
	  eventTypeAbbrev = 'Dth';
	} else {
	  eventTypeAbbrev = eventType.substr(0, 3);
	}
	let actPageText = '';
	if (actPage != '') {
	  actPageText += ', p '+actPage;
	}
	let actNoText = '';
	if (actNo != '') {
	  actNoText += ', No '+actNo;
	}
	let refname = givNames1[0];
	for (let i = 0; i < givNames1.length; i++) {
	  if (givNames1[i] === ' ') {
		refname += givNames1[i+1];
	  }
	}
	let actName = givNames1;
	if (surname1 != '') {
	  if (actName === '') {
		actName = surname1;
	  } else {
		actName += ' '+surname1;
	  }
	}
	if (eventType === 'Marriage') {
	  if (surname1 != '') {
		refname += surname1[0];
	  }
	  refname += 'and'+givNames2[0];
	  for (let i = 0; i < givNames2.length; i++) {
		if (givNames2[i] === ' ') {
		  refname += givNames2[i+1];
		}
	  }
	  if (surname2 != '') {
		refname += surname2[0];
	  }
	  actName += ' and '+givNames2;
	  if (surname2 != '') {
		actName += ' '+surname2;
	  }
	} else {
	  refname = surname1+refname;
	}
	const actDate = actDateStr;
	const actYear = actDateStr.slice(-4);
	openNamedRef = '<ref name="'+actYear+eventTypeAbbrev+refname+'">'
    //console.log("Starting citPart2 processing");
	citPart2 = ', \'\'\''+eventType+' '+actName+', '+actDateStr+'\'\'\''+actPageText+actNoText;
    //console.log("citPart2="+citPart2);
    // do processing with data
    // you need to right click the extension icon and choose "inspect popup"
    // to view the messages appearing on the console.
}

function documentEvents() {    
  document.getElementById('save_inputs_btn').addEventListener('click', 
    function() { myAction(document.getElementsByTagName('input'));
  });

  // you can add listeners for other objects ( like other buttons ) here 
}

//console.log("Ending contentScript.js");
