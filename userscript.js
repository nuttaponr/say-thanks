// ==UserScript==
// @name         Bearbit+
// @namespace    Violentmonkey Scripts
// @version      1.0.3
// @description  Auto "say thanks" Bearbit
// @author       You
// @match        *://*.bearbit.org/*
// @icon         https://raw.githubusercontent.com/nuttaponr/say-thanks/refs/heads/main/icons/48x48.png
// @grant        none
// ==/UserScript==

(function() {
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

    if (itemId) {
        sendThanksRequest(itemId);
    }

    const xpath = "/html/body/table[2]/tbody/tr[3]/td/table/tbody/tr";
    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const rowsToRemove = [];

    for (let i = 0; i < result.snapshotLength; i++) {
        const row = result.snapshotItem(i);

        const cells = row.querySelectorAll('td');
        if (cells.length <= 3) {
            return;
        }

        const img = cells[0].querySelector('a > img');
        if (img && img.src.includes("pic/categories/cat-man.gif")) {
            rowsToRemove.push(row);
        }

        const secondTd = cells[1];
        const secondLink = secondTd.querySelectorAll('a')[1];

        const newTd = document.createElement('td');
        newTd.setAttribute('width', '50');
        newTd.setAttribute('align', 'center');
        newTd.className = "colhead"
        newTd.style.backgroundColor = window.getComputedStyle(secondTd).backgroundColor;
        if (i === 0) {
            newTd.textContent = 'Preview';
        } else if (secondLink) {
            const hrefUrl = secondLink.href;
            const img = document.createElement('img');
            img.setAttribute('src', hrefUrl); // Use the href as the image URL
            img.setAttribute('alt', 'Image Preview');
            img.setAttribute('style', 'max-width: 100%; height: auto;'); // Optionally style the image
            // Create a tooltip container for the balloon
            const tooltip = document.createElement('div');
            tooltip.setAttribute('style', `
                    position: absolute;
                    display: none;
                    border: 1px solid #ccc;
                    background: #fff;
                    z-index: 1000;
                    padding: 5px;
                    max-width: 40%;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            `);

            document.body.appendChild(tooltip);

            // Set up the mouseover and mouseout events
            img.addEventListener('mouseover', (event) => {
                const originalImg = document.createElement('img');
                //originalImg.setAttribute('src', secondLink.href); // Use the href for the full-size image
                originalImg.setAttribute('srcset', `${secondLink.href} 0.5x`);
                originalImg.setAttribute('style', `
                max-width: 100%;  /* Display the image at 30% of its original size */
                height: auto;
                `);

                tooltip.appendChild(originalImg);
                // Position the tooltip
                tooltip.style.display = 'block';
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
                tooltip
            });

            img.addEventListener('mousemove', (event) => {
                // Update the position of the tooltip
                tooltip.style.left = `${event.pageX + 10}px`;
                //tooltip.style.left = `${window.innerWidth/2}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
                //tooltip.style.top = `${window.innerHeight/2}px`;
                //coordinates.textContent = `Screen: Width = ${window.innerWidth}, Height = ${window.innerHeight}`;
            });

            img.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            newTd.appendChild(img);
        }
        row.insertBefore(newTd, cells[1]);
    }

    rowsToRemove.forEach(row => row.parentNode.removeChild(row));
})();
