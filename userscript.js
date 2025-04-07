// ==UserScript==
// @name         Bearbit+
// @namespace    Violentmonkey Scripts
// @version      1.0.8
// @description  Auto "say thanks" Bearbit
// @author       You
// @match        *://*.bearbit.org/*
// @match        *://*.bearbit.cc/*
// @icon         https://raw.githubusercontent.com/nuttaponr/say-thanks/refs/heads/main/icons/48x48.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/ajax.php`;
    const detailsUrl = `${baseUrl}/details.php`;
    const queryParams = new URLSearchParams(window.location.search);
    const itemId = queryParams.get("id");


    function sendThanksRequest(id) {
        if (!id) return;

        const params = new URLSearchParams({ action: "say_thanks", id: id });
        fetch(`${apiUrl}?${params.toString()}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                return response.text();
            })
            .then(data => console.log("Response:", data))
            .catch(error => console.error("Error sending thanks request:", error));
    }

    function updateTooltipPosition(event, tooltip, rectTop) {
        const scrollTop = Math.max(document.scrollingElement.scrollTop, rectTop + 10);
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${scrollTop}px`;
    }

    function createTooltip(imageUrl) {
        const tooltip = document.createElement('div');
        tooltip.style = `
            position: absolute;
            display: none;
            border: 1px solid #ccc;
            background: #fff;
            z-index: 1000;
            padding: 5px;
            max-width: 40%;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);`;

        const img = document.createElement('img');
        img.srcset = `${imageUrl} 0.5x`;
        img.style = "max-width: 100%; height: auto;";
        tooltip.appendChild(img);

        document.body.appendChild(tooltip);
        return tooltip;
    }

    function addPreviewColumn() {
        const xpath = "/html/body/table[2]/tbody/tr[3]/td/table/tbody/tr";
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        const rowsToRemove = [];
        let rectTop = 0;
        const tables = document.querySelectorAll('body > table.mainouter > tbody > tr > td.outer > table');
        if (tables.length >= 1) {
            rectTop = tables[1]?.getBoundingClientRect().top || 0;
        }

        for (let i = 0; i < result.snapshotLength; i++) {
            const row = result.snapshotItem(i);
            const cells = row.querySelectorAll('td');
            if (cells.length <= 3) continue;

            const img = cells[0].querySelector('a > img');
            if (img && img.src.includes("pic/categories/cat-man.gif")) {
                rowsToRemove.push(row);
                continue;
            }

            const secondTd = cells[1];
            const secondLink = secondTd.querySelectorAll('a')[1];
            const newTd = document.createElement('td');
            newTd.width = '50';
            newTd.align = 'center';
            newTd.className = "colhead";
            newTd.style.backgroundColor = window.getComputedStyle(secondTd).backgroundColor;

            if (i === 0) {
                newTd.textContent = 'Preview';
            } else if (secondLink) {
                const img = document.createElement('img');
                img.src = secondLink.href;
                img.alt = 'Image Preview';
                img.style = 'max-width: 100%; height: auto;';

                const tooltip = createTooltip(secondLink.href);
                img.addEventListener('mouseover', event => {
                    tooltip.style.display = 'block';
                    updateTooltipPosition(event, tooltip, rectTop);
                });
                img.addEventListener('mousemove', event => updateTooltipPosition(event, tooltip, rectTop));
                img.addEventListener('mouseout', () => tooltip.style.display = 'none');

                newTd.appendChild(img);
            }

            row.insertBefore(newTd, cells[1]);
        }
        rowsToRemove.forEach(row => row.parentNode.removeChild(row));
    }
    itemId ? sendThanksRequest(itemId) : addPreviewColumn();
})();
