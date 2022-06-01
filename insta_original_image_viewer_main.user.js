// ==UserScript==
// @name		Instagram Original Image Viewer (beta)
// @version		0.2
// @description	Easily view Instagram images in their original size and save them on your computer
// @author		Cendolt
// @namespace	https://github.com/Cendolt/
// @match		https://www.instagram.com/*
// @icon		https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @run-at 		document-idle
// @grant		GM_addStyle
// @grant		GM_addElement
// ==/UserScript==

var resizeObserver = new ResizeObserver(entries => {
	entries.forEach (entry => {
		var imgContainer = entry.target.classList.contains("_aa06") ? entry.target : null;
		if (imgContainer) {
			var btn = imgContainer.querySelector('[class="IMBTN"]');
			if (btn) {
				btn.style.setProperty("--BTN_bg_sizes", imgContainer.offsetWidth + "px");
			}	
		}
	});
});

function updateImgContainers() {
	resizeObserver.disconnect();
	const imgContainers = document.querySelectorAll('[class="_aa06"]');
	imgContainers.forEach( imgContainer =>
	{
		imgContainer.addEventListener ("mouseenter", onImageMouseEnter, false );
		imgContainer.addEventListener ("mouseleave", onImageMouseLeave, false );

		resizeObserver.observe(imgContainer);
	});
};

function onImageMouseEnter(event) {
	var imgContainer = event.target;
	const img = imgContainer.querySelector('[class="_aagt"]');
	if (img != null) {
		var imgSrc = img.getAttribute('src');
		addDLBtnToImage(imgContainer, imgSrc);
	}
}

function onImageMouseLeave(event) {
	var imgContainer = event.target;
	const img = imgContainer.querySelector('[class="_aagt"]');
	if (img != null) {
		removeDLBtnFromImage(imgContainer);
	}
}

/*
* @description Add a "View original" button to the image 
* @param {Element}	imgContainer	Image for which to add the button
* @param {String}	imgSrc			Link to the original image file
*/
function addDLBtnToImage(imgContainer, imgSrc) {
	var btnDiv = imgContainer.querySelector('[class="_aagw"]');

	var btn = imgContainer.querySelector('[class="IMBTN"]');
	if (btn == null) {
		btn = GM_addElement(btnDiv, 'button', {
			class: 'IMBTN',
			type: 'button',
			textContent: 'View original'
		});
		btn.style.setProperty("--BTN_bg_sizes", imgContainer.offsetWidth + "px");
		btn.addEventListener("click", onDlBtnClick, false);
	}
	if (imgSrc) {
		btn.setAttribute("imgSrc", imgSrc);
		btn.style["background-image"] = 'url("' + imgSrc +'")';
	}
	
	var dummybtn = imgContainer.querySelector('[class="DUMMYBTN"]');
	if (dummybtn == null) {
		dummybtn = GM_addElement(btnDiv, 'div', {
			class: 'DUMMYBTN',
			tabindex: '-1',
			textContent: 'View original'
		});
	}
}

/*
* @param {Element}	imgContainer	Image to remove the button from
*/
function removeDLBtnFromImage(imgContainer) {
	var btnDiv = imgContainer.querySelector('[class="_aagw"]');
	
	var btn = imgContainer.querySelector('[class="IMBTN"]');
	if (btn) {
		btn.removeEventListener("click", onDlBtnClick, false);
		btnDiv.removeChild(btn);
	}
	var dummybtn = imgContainer.querySelector('[class="DUMMYBTN"]');
	if (dummybtn) {	
		btnDiv.removeChild(dummybtn);
	}
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
	._aagw .DUMMYBTN, ._aagw .IMBTN{
		--BTN_margin: 4px;
		--BTN_padding: 3px 8px;
		--BTN_radius: 25px;

		position: absolute;
		right: 0;
		bottom: 0;
		width:fit-content;
		font-weight: var(--font-weight-system-semibold);
		text-align: center;

		margin: var(--BTN_margin);
		padding: var(--BTN_padding);
		border-radius: var(--BTN_radius);
	}

    ._aagw .DUMMYBTN{
		color: transparent;
		background: rgba(255,255,255,.8);
		box-shadow: 0px 0px 3px rgba(38,38,38,1);

		z-index: 3;
	}

	._aagw .IMBTN{
		--BTN_bg_sizes: 100%;
		cursor: pointer;

		border: 0px solid rgba(255,255,255,0.0);

		background-position: bottom calc(0px - var(--BTN_margin))
							 right calc(0px - var(--BTN_margin));
		background-size: var(--BTN_bg_sizes) auto;
		background-repeat: no-repeat;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: rgba(38,38,38,0.25);

		z-index: 4;
	}

    ._aagw .IMBTN:hover ~ .DUMMYBTN{
		--BTN_margin: 3px;
		--BTN_padding: 4px 9px;
	}

	._aagw .IMBTN:hover{
		
	}

	._aagw .IMBTN:active ~ .DUMMYBTN{
		background: rgba(255,255,255,0.9);
		--BTN_margin: 4px;
		--BTN_padding: 3px 8px;
	}

	._aagw .IMBTN:active{
		-webkit-text-fill-color: rgba(38,38,38,0.75);
	}

    `);
	var observer = new MutationObserver(onDocumentMutation);

	observer.observe(document, {childList: true, subtree: true});
}, false);
