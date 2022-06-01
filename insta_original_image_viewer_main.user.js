// ==UserScript==
// @name		Instagram Original Image Viewer (beta)
// @version		0.2.1
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
		var imgContainer = entry.target.classList.contains("BTNCTN") ? entry.target : null;
		if (imgContainer) {
			var btn = imgContainer.querySelector('[class="IMBTN"]');
			if (btn) {
				btn.style.setProperty("--BTN_bg_sizes", imgContainer.offsetWidth + "px");
			}	
		}
	});
});

function isValidContainer(imgContainer) {
	return !(imgContainer.querySelector('img') == null
		|| imgContainer.querySelector('li[role="menuitem"], div[role="button"]'));
}

function updateImgContainers() {
	resizeObserver.disconnect();
	const imgContainers = document.querySelectorAll('article[role="presentation"] div[role="button"]:not([aria-disabled])');
	imgContainers.forEach( imgContainer => 
		{
		if (isValidContainer(imgContainer)) {
			imgContainer.addEventListener ("mouseenter", onImageMouseEnter, false );
			imgContainer.addEventListener ("mouseleave", onImageMouseLeave, false );
	
			resizeObserver.observe(imgContainer);
		}
	});
};

function onImageMouseEnter(event) {
	var imgContainer = event.target;
	const img = imgContainer.querySelector('img');
	if (img != null) {
		var imgSrc = img.getAttribute('src');
		addDLBtnToImage(imgContainer, imgSrc);
	}
}

function onImageMouseLeave(event) {
	var imgContainer = event.target;
	const img = imgContainer.querySelector('img');
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
	imgContainer.classList.add("BTNCTN");
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
	if (imgSrc) {
		btn.setAttribute("src", imgSrc);
		btn.style["background-image"] = 'url("' + imgSrc +'")';
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
	imgContainer.classList.remove("BTNCTN");
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

function onDocumentMutation(changes, observer) {
	updateImgContainers();
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
	var observer = new MutationObserver(onDocumentMutation);

	observer.observe(document, {childList: true, subtree: true});
}, false);
