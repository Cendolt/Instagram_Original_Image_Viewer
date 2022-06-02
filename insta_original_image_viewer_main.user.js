// ==UserScript==
// @name		Instagram Original Image Viewer (beta)
// @version		0.2.3
// @description	Easily view Instagram images in their original size and save them on your computer
// @author		Cendolt
// @namespace	https://github.com/Cendolt/
// @match		https://www.instagram.com/*
// @icon		https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @run-at 		document-idle
// @grant		GM_addStyle
// @grant		GM_addElement
// ==/UserScript==

/**
* @desc 	Observe image container resize event to update transparent text background image size
*/
var resizeObserver = new ResizeObserver(entries => {
	entries.forEach (entry => {
		if (entry.target.classList.contains("BTNCTN")) {
			var btn = entry.target.querySelector('[class="IMBTN"]');
			if (btn) {
				btn.style.setProperty("--BTN_bg_sizes", entry.contentRect.width + "px");
			}	
		}
	});
});

/**
* @desc 	Check if element is a valid image container
* @param 	{Element}	element	- Element to check validity for
* @returns 	{bool}		true:valid false:invalid
*/
function isValidContainer(element) {
	return !(element.querySelector('img') == null 
		|| element.querySelector('li[role="menuitem"], div[role="button"]'));
}

/**
* @desc 	Update the source image url 
* @param 	{Element}	imgContainer - Image container for which to update button image source
* @param 	{String}	imgSrc - URL to the original image source
*/
function updateImageLink(imgContainer, imgSrc) {
	var btn = imgContainer.querySelector('[class="IMBTN"]');
	if (btn != null) {
		btn.setAttribute("src", imgSrc);
		btn.style["background-image"] = 'url("' + imgSrc +'")';
	}
}

/**
* @desc 	Search for image containers within node and add image download buttons to valid ones
* @param 	{Node}	node - Node to search for image containers
*/
function updateImgContainers(node) {
	const imgContainers = node.querySelectorAll('article[role="presentation"] div[role="button"]:not([aria-disabled])');
	imgContainers.forEach( imgContainer => {
		if (isValidContainer(imgContainer) && !imgContainer.classList.contains("BTNCTN")) {	
			imgContainer.classList.add("BTNCTN");
			resizeObserver.observe(imgContainer);

			addDLBtnToImage(imgContainer);
			imgSrc = imgContainer.querySelector('img').getAttribute('src');
			if (imgSrc != null) {
				updateImageLink(imgContainer, imgSrc);
			}

			new MutationObserver( (mutations, observer) => {
				mutations.forEach(mutation => {
					if (mutation.attributeName == "src") {
						imgSrc = mutation.target.getAttribute(mutation.attributeName);
						if (imgSrc != null && imgSrc != mutation.oldValue) {
							updateImageLink(imgContainer, imgSrc);
						}
					}
				});
			}).observe(imgContainer.querySelector('img'), {subtree: true, attributeFilter: ["src"], attributeOldValue: true});
		}
	});
};

/**
* @desc 	Add a "View original" button to the image 
* @param 	{Element}	imgContainer - Image container for which to add the button
*/
function addDLBtnToImage(imgContainer) {
	var btn = imgContainer.querySelector('[class="IMBTN"]');
	if (btn == null) {
		btn = GM_addElement(imgContainer, 'button', {
			class: 'IMBTN',
			type: 'button',
			textContent: 'View original'
		});
		btn.style.setProperty("--BTN_bg_sizes", imgContainer.offsetWidth + "px");
		btn.addEventListener("click", onDlBtnClick, false);
	}

	var dummybtn = imgContainer.querySelector('[class="DUMMYBTN"]');
	if (dummybtn == null) {
		dummybtn = GM_addElement(imgContainer, 'div', {
			class: 'DUMMYBTN',
			tabindex: '-1',
			textContent: 'View original'
		});
	}
}

/**
* @desc 	Remove "View original" button from image container
* @param 	{Element}	imgContainer - Image container to remove the button from
*/
function removeDLBtnFromImage(imgContainer) {
	var btn = imgContainer.querySelector('[class="IMBTN"]');
	if (btn) {
		btn.removeEventListener("click", onDlBtnClick, false);
		imgContainer.removeChild(btn);
	}
	var dummybtn = imgContainer.querySelector('[class="DUMMYBTN"]');
	if (dummybtn) {	
		imgContainer.removeChild(dummybtn);
	}
}

/**
* @desc 	Open image in a new tab on "View original" button click
* @param 	{MouseEvent}	event - Mouse click event
*/
function onDlBtnClick(event) {
	const imgSrc = event.target.getAttribute('src');
	if (imgSrc)
	{
		window.open(imgSrc);
	}
}

/**
* @desc 	Observe DOM mutations for nodes containing images
*/
function onDocumentMutation(mutations, observer) {
	mutations.forEach(mutation => {
		if (mutation.type == 'childList') {
			if (mutation.target.querySelector('img') != null) {
				updateImgContainers(document);
			}
		}
	});
}

window.addEventListener('load', function(){
	GM_addStyle(`
	.BTNCTN .DUMMYBTN, .BTNCTN .IMBTN{
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

		visibility: hidden;
	}

	.BTNCTN:hover .DUMMYBTN, .BTNCTN:hover .IMBTN{
		visibility: visible;
	}

    .BTNCTN .DUMMYBTN{
		color: transparent;
		background: rgba(255,255,255,.8);
		box-shadow: 0px 0px 3px rgba(38,38,38,1);

		z-index: 3;
	}

	.BTNCTN .IMBTN{
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

    .BTNCTN .IMBTN:hover ~ .DUMMYBTN{
		--BTN_margin: 3px;
		--BTN_padding: 4px 9px;
	}

	.BTNCTN .IMBTN:hover{
		
	}

	.BTNCTN .IMBTN:active ~ .DUMMYBTN{
		background: rgba(255,255,255,0.9);
		--BTN_margin: 4px;
		--BTN_padding: 3px 8px;
	}

	.BTNCTN .IMBTN:active{
		-webkit-text-fill-color: rgba(38,38,38,0.75);
	}

    `);

	var mutationObserver = new MutationObserver(onDocumentMutation);

	mutationObserver.observe(document.querySelector("body"), {childList: true, subtree: true});
}, false);
