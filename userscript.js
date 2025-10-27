// ==UserScript==
// @name         Bearbit+
// @namespace    Violentmonkey Scripts
// @version      1.0.9
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

        const params = new URLSearchParams({
            action: "say_thanks",
            id: id
        });
        fetch(`${apiUrl}?${params.toString()}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                return response.text();
            })
            .then(data => console.log("Response:", data))
            .catch(error => console.error("Error sending thanks request:", error));
    }

    function kick() {
        const xpath = "/html/body/table[2]/tbody/tr[3]/td/table/tbody/tr";
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0; i < result.snapshotLength; i++) {
            const row = result.snapshotItem(i);
            const cells = row.querySelectorAll('td');
            if (cells.length <= 3) continue;

            const img = cells[0].querySelector('a > img');
            if (img && img.src.includes("pic/categories/cat-man.gif")) {
                row.remove(); // 🚀 remove the whole row
            }
        }
    }

    itemId ? sendThanksRequest(itemId) : kick();

})();
