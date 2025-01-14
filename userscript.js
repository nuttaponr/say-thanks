// ==UserScript==
// @name         SB Saythank
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Auto "say thanks" for Siambit and Bearbit
// @author       You
// @match        *://*.siambit.me/*
// @match        *://*.bearbit.co/*
// @match        *://*.bearbit.*/*
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
})();
