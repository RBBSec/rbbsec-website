

#### 15. Basic Score Validation (Anti-Cheating)

*   **Problem:** Users could potentially submit arbitrary high scores directly via the console, bypassing game logic.
*   **Resolution:** Implemented server-side validation in `submitScore/index.js` to reject scores greater than 100.
    ```javascript
    if (!fullName || !leaderboardName || typeof score !== 'number' || score <= 0 || score > 100 || !consentCheckbox) {
        // ... return 400 error
    }
    ```
*   **Deployment:** Instructed user to re-deploy the function app to apply these changes.