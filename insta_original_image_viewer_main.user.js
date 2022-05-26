// ==UserScript==
// @name		Instagram Original Image Viewer (beta)
// @version		0.1
// @description	Easily view Instagram images in their original size and save them on your computer
// @author		Cendolt
// @namespace	https://github.com/Cendolt/
// @match		https://www.instagram.com/*
// @icon		https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @run-at 		document-idle
// @grant		GM_addStyle
// @grant		GM_addElement
// ==/UserScript==

function updateImgContainers() {
	const imgContainers = document.querySelectorAll('[class="ZyFrc"]');
	imgContainers.forEach( imgContainer =>
	{
		imgContainer.addEventListener ("mouseenter", onImageMouseEnter, false );
		imgContainer.addEventListener ("mouseleave", onImageMouseLeave, false );
	});
};

function onImageMouseEnter(event) {
	var imgContainer = event.target;
	const img = imgContainer.querySelector('[class="FFVAD"]');
	if (img != null) {
		var imgSrc = img.getAttribute('src');
		addDLBtnToImage(imgContainer, imgSrc);
	}
}

function onImageMouseLeave(event) {
	var imgContainer = event.target;
	const img = imgContainer.querySelector('[class="FFVAD"]');
	if (img != null) {
		removeDLBtnFromImage(imgContainer);
	}
}

/*
* @param {Element}	imgContainer	Image for which to add the button
* @param {String}	imgSrc			Link to the original image file
*/
function addDLBtnToImage(imgContainer, imgSrc) {
	if (imgContainer.querySelector('[class="DUMMYBTN"]')) return;
	var btnDiv = imgContainer.querySelector('[class="_9AhH0"]');

	var dummybtn = GM_addElement(btnDiv, 'div', {
		class: 'DUMMYBTN'
	});

	var btn = GM_addElement(dummybtn, 'button', {
		class: 'IMBTN',
		type: 'button',
		imgSrc: imgSrc,
		textContent: 'View original'
	});

	btn.addEventListener ("click", onDlBtnClick, false);
}

/*
* @param {Element}	imgContainer	Image to remove the button from
*/
function removeDLBtnFromImage(imgContainer) {
	var dummybtn = imgContainer.querySelector('[class="DUMMYBTN"]');
	if (dummybtn == null) return;
	imgContainer.querySelector('[class="IMBTN"]').removeEventListener (
		"click", onDlBtnClick, false);
	var btnDiv = imgContainer.querySelector('[class="_9AhH0"]');
	btnDiv.removeChild(dummybtn);
}

/*
* @param {MouseEvent}	event	Mouse click event
*/
function onDlBtnClick(event) {
	const imgSrc = event.target.getAttribute('imgSrc');
	if (imgSrc)
	{
		window.open(imgSrc);
	}
}

function onDocumentMutation(changes, observer) {
	updateImgContainers();
}

window.addEventListener('load', function(){
	GM_addStyle(`
    .DUMMYBTN{
		position: absolute;
		right: 0;
		bottom: 0;
		margin: 3px;
		width:fit-content;
		padding: -1px;
		background: rgba(255,255,255,0.8);
		border-radius: 25px;
		border-width: 1px;
		border-color: rgba(255,255,255,0.0);
		background-clip:padding-box;
		mix-blend-mode: normal;
	}

	.DUMMYBTN .IMBTN{
		cursor: pointer;
		//width:fit-content;
		padding: 3px 8px;
		margin: -1px;
		font-weight: 600;
		background: transparent;
		border: 1px solid rgba(255,255,255,0.0);
		border-radius: 25px;
		background-clip:border-box;
	  	mix-blend-mode: color-burn;
	}

    .DUMMYBTN:hover{
		background: rgba(255,255,255,0.8);
	}

	.DUMMYBTN:hover .IMBTN{
	  	mix-blend-mode: normal;
	}

 	.DUMMYBTN:active{
		background: rgba(255,255,255,0.9);
		padding: 0px;
		background-clip:padding-box;
	}

	.IMBTN:active{
		color: rgba(142,142,142,1);
		border-color: rgba(142,142,142,1);
		background-clip:margin-box;
	  	mix-blend-mode: normal;
	}

    `);
	var observer = new MutationObserver(onDocumentMutation);

	observer.observe(document, {childList: true, subtree: true});
}, false);
