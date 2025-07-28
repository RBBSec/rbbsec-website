

#### 19. Frontend Duration Calculation Precision

*   **Problem:** Score submission failed with "Invalid duration" error even for legitimate short games, as `Date.now()` resulted in 0ms duration.
*   **Resolution:** Modified `snek.js` to use `performance.now()` for calculating `gameStartTime` and `duration`. This provides higher precision, ensuring even very short game durations are positive and pass backend validation.
*   **Deployment:** Instructed user to re-deploy the frontend code to apply these changes.