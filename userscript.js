// ==UserScript==
// @name         Bearbit+
// @namespace    Violentmonkey Scripts
// @version      1.0.1.16
// @description  Auto "say thanks" Bearbit
// @author       You
// @match        *://*.bearbit.org/*
// @match        *://*.bearbit.cc/*
// @icon         https://raw.githubusercontent.com/nuttaponr/say-thanks/refs/heads/main/icons/48x48.png
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/ajax.php`;

    const queryParams = new URLSearchParams(location.search);
    const torrentId = queryParams.get("id");

    function sendThanks(torrentId) {
        if (!torrentId) return;

        const params = new URLSearchParams({
            action: "say_thanks",
            id: torrentId
        });

        fetch(`${apiUrl}?${params}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(data => console.log("Thanks sent:", data))
            .catch(error => console.error("Failed to send thanks:", error));
    }

    function removeMaleCategoryRows() {
        const xpath = "/html/body/table[2]/tbody/tr[3]/td/table/tbody/tr";
        const rows = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        for (let i = 0; i < rows.snapshotLength; i++) {
            const row = rows.snapshotItem(i);
            const img = row.querySelector("td:first-child a > img");
            if (img?.src.includes("pic/categories/cat-man.gif")) {
                row.remove();
            }
        }
    }

    function autoClickDownloadButton() {
        if (location.pathname !== "/downloadnew.php") return;
        const timer = setInterval(() => {
            const button = document.getElementById("bbDlBtn");
            if (!button) return;
            clearInterval(timer);
            setTimeout(() => {
                btn.click();
                setTimeout(() => { window.close(); }, 1000);

            }, 5000);
        }, 500);
    }

    function removeRightSidebar() {
        const xpath = "/html/body/table[2]/tbody/tr[1]/td/table/tbody/tr/td[4]";
        const node = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        node?.remove();
    }

    if (torrentId) {
        sendThanks(torrentId);
    } else {
        removeMaleCategoryRows();
    }

    autoClickDownloadButton();
    removeRightSidebar();

})();
