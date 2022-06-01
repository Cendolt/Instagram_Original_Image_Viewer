// ==UserScript==
// @name		Instagram Original Image Viewer (beta)
// @version		0.2.2
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
		if (entry.target.classList.contains("BTNCTN")) {
			var btn = entry.target.querySelector('[class="IMBTN"]');
			if (btn) {
				btn.style.setProperty("--BTN_bg_sizes", entry.contentRect.width + "px");
			}	
		}
	});
});

function isValidContainer(imgContainer) {
	return !(imgContainer.querySelector('img') == null 
		|| imgContainer.querySelector('li[role="menuitem"], div[role="button"]'));
}

function updateImgContainers(node) {
	//resizeObserver.disconnect();
	const imgContainers = node.querySelectorAll('article[role="presentation"] div[role="button"]:not([aria-disabled])');
	imgContainers.forEach( imgContainer => {
		if (isValidContainer(imgContainer) && !imgContainer.classList.contains("BTNCTN")) {	
			new MutationObserver( (mutations, observer) => {
				imgSrc = imgContainer.querySelector('img').getAttribute('src');
				if (imgSrc != null) {
					addDLBtnToImage(imgContainer, imgSrc);	
					observer.disconnect();
				}
			}).observe(imgContainer, {subtree: true, attributeFilter: ["class", "src"]});
			imgContainer.classList.add("BTNCTN");

			resizeObserver.observe(imgContainer);
		}
	});
};

/*
* @description Add a "View original" button to the image 
* @param {Element}	imgContainer	Image for which to add the button
* @param {String}	imgSrc			Link to the original image file
*/
function addDLBtnToImage(imgContainer, imgSrc) {
	var btn = imgContainer.querySelector('[class="IMBTN"]');
	if (btn == null) {
		btn = GM_addElement(imgContainer, 'button', {
			class: 'IMBTN',
			type: 'button',
			textContent: 'View original'
		});
		btn.style.setProperty("--BTN_bg_sizes", imgContainer.offsetWidth + "px");
		btn.setAttribute("src", imgSrc);
		btn.style["background-image"] = 'url("' + imgSrc +'")';
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

/*
* @param {Element}	imgContainer	Image to remove the button from
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

/*
* @param {MouseEvent}	event	Mouse click event
*/
function onDlBtnClick(event) {
	const imgSrc = event.target.getAttribute('src');
	if (imgSrc)
	{
		window.open(imgSrc);
	}
}

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
