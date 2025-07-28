#### 10. Firebase App Initialization Error

*   **Problem:** Azure Functions returned "The default Firebase app already exists" error, indicating `initializeApp()` was called multiple times within the same worker process.
*   **Resolution:** Modified both `submitScore/index.js` and `getLeaderboard/index.js` to check if a Firebase app is already initialized before calling `initializeApp()`.
    ```javascript
    const { initializeApp, cert, getApps } = require('firebase-admin/app');
    // ...
    if (!getApps().length) {
        initializeApp({
            credential: cert(serviceAccount),
        });
    }
    ```
*   **Deployment:** Instructed user to re-deploy the function app to apply these changes.