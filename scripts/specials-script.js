function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

waitForElm('.offer-strip').then((elm) => {
    calculateSpecialsPercentage();
});


// Work out how to consolidate duplicate code in specials-script.js
function calculateSpecialsPercentage() {
    const offers = document.querySelectorAll('.offer-strip');
    let bestOfferVal = 0;
    offers.forEach(offer => {
        // Todo: See if the api response can be used instead of DOM manipulation
        const normalPrice = offer.querySelector('.offers-normal-tile');
        let normalPriceVal = normalPrice.textContent.match(/\$?([\d,]+(\.\d*)?)/);
        if (normalPriceVal) {
            normalPriceVal = parseFloat(normalPriceVal[0].replace('$', ''));
        }

        const specialPrice = offer.querySelector('.card-price');
        let specialPriceVal = offer.textContent.match(/\$?([\d,]+(\.\d*)?)/);
        if (specialPriceVal) {
            specialPriceVal = parseFloat(specialPriceVal[0].replace('$', ''));
        }

        // Todo: handle bulk buy scenarios (cases/bundles)
        const percentageVal = ((normalPriceVal-specialPriceVal) / normalPriceVal * 100).toFixed(0);

        if (percentageVal <= 0)
            return;

        const percentageDiv = document.createElement('div');
        percentageDiv.classList.add('percentage-wrapper');
        percentageDiv.innerHTML = `<span class="percentage">${percentageVal}%</span> saving`;
        
        if (percentageVal >= 20) {
            percentageDiv.classList.add('large-savings');
        } else if (percentageVal < 10) {
            percentageDiv.classList.add('small-savings');
        }

        const offerText = offer.querySelector('.product-card-cost');
        if (!offerText.querySelector('.percentage'))
            offerText.appendChild(percentageDiv);

        if (parseInt(percentageVal) > bestOfferVal) {
            bestOfferVal = percentageVal;
            document.querySelectorAll('.best-offer').forEach(elm => elm.remove());
            
            const bestOfferImg = document.createElement('img');
            bestOfferImg.classList.add('best-offer');
            bestOfferImg.src = chrome.runtime.getURL("images/best-offer-cat.png");
            bestOfferImg.alt = "This is the best offer on the page!";
            offerText.appendChild(bestOfferImg);
        }

        offer.querySelector('.offers-normal-tile')?.classList.add('normal-price');
    });
}