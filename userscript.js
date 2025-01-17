// ==UserScript==
// @name         Bearbit+
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Auto "say thanks" Bearbit
// @author       You
// @match        *://*.bearbit.co/*
// @icon         https://raw.githubusercontent.com/nuttaponr/say-thanks/refs/heads/main/icons/48x48.png
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Get the base URL of the current website
    const baseUrl = window.location.origin;

    // Construct API and details URLs
    const apiUrl = `${baseUrl}/ajax.php`;
    const detailsUrl = `${baseUrl}/details.php`;

    // Extract query parameters from the current URL
    const queryParams = new URLSearchParams(window.location.search);
    const itemId = queryParams.get("id");

    // Function to send a "say thanks" request
    const sendThanksRequest = async (id) => {
        try {
            const params = new URLSearchParams({
                action: "say_thanks",
                id: id,
            });

            const response = await fetch(`${apiUrl}?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const responseData = await response.text();
            console.log("Response:", responseData);
        } catch (error) {
            console.error("Error sending thanks request:", error);
        }
    };

    // Trigger the request if an item ID is present in the URL
    if (itemId) {
        sendThanksRequest(itemId);
    }

    function cacheImage(url) {
        const cachedImage = GM_getValue(url);

        if (cachedImage) {
            console.log(`Image is already cached: ${url}`);
            return cachedImage;
        }

        console.log(`Caching image: ${url}`);

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            responseType: 'blob',
            onload: function (response) {
                const reader = new FileReader();
                reader.onload = function () {
                    const base64data = reader.result;
                    GM_setValue(url, base64data);
                    console.log(`Cached image: ${url}`);
                };
                reader.readAsDataURL(response.response);
            },
            onerror: function (err) {
                console.error(`Failed to cache image: ${url}`, err);
            }
        });
    }

    function cacheAllImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const imgUrl = img.src;
            const cachedData = cacheImage(imgUrl);
            if (cachedData) {
                img.src = cachedData;
            }
        });
    }

    // Run when the page content is loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Page content loaded. Caching images...');
        cacheAllImages();
    });

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                console.log('New content detected. Caching new images...');
                cacheAllImages();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const xpath = "/html/body/table[2]/tbody/tr[3]/td/table/tbody/tr";
    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    for (let i = 0; i < result.snapshotLength; i++) {
        const row = result.snapshotItem(i);

        const cells = row.querySelectorAll('td');
        if (cells.length < 3) {
            return;
        }

        const newTd = document.createElement('td');
        newTd.setAttribute('width', '50');
        newTd.setAttribute('align', 'center');

        let secondLink = null;
        if (cells.length > 1) {
            const secondTd = cells[1]; // Second <td> element
            secondLink = secondTd.querySelectorAll('a')[1]; // Second <a> tag inside the second <td>
            newTd.style.backgroundColor = window.getComputedStyle(secondTd).backgroundColor;;
        }

        if (i === 0) {
            newTd.textContent = 'Preview';
        } else if (secondLink) {
            newTd.className = "colhead"
            const img = document.createElement('img');
            img.setAttribute('src', secondLink.href); // Use the href as the image URL
            img.setAttribute('alt', 'Image Preview');
            img.setAttribute('style', 'max-width: 100%; height: auto;'); // Optionally style the image
            newTd.appendChild(img);
        }

        // Insert the new <td> at index 2 (third column)
        if (cells.length > 2) {
            row.insertBefore(newTd, cells[2]);
        } else {
            // If there are less than 3 cells, append the new <td> at the end
            row.appendChild(newTd);
        }
    }
})();
