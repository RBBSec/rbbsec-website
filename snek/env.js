import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app-check.js";

const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LfQaWkrAAAAAJWnZNtOSNpAlKv3DAvnTU6M78YH'),
    isTokenAutoRefreshEnabled: true,
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCnCp3Vwq2v40PLtMtcWH2gOCrxt_AqevQ",
    authDomain: "snake-leaderboard-d05da.firebaseapp.com",
    projectId: "snake-leaderboard-d05da",
    storageBucket: "snake-leaderboard-d05da.appspot.com",
    messagingSenderId: "74987896750",
    appId: "1:74987896750:web:360149771273fff5e3523f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.firebase = {
    scoresRef: collection(db, "leaderboard"),
    addDoc,
    getDocs,
    query,
    orderBy,
    limit
};