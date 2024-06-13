import { initializeApp } from "firebase/app";

import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: "bikesharing-420214.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);// Initialize Firebase Auth provider
const provider = new GoogleAuthProvider();

// whenever a user interacts with the provider, we force them to select an account
provider.setCustomParameters({   
    prompt : "select_account "
});
export const auth = getAuth();

// let loggedInUser = null;

// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     loggedInUser = user
//   }
// });


// export const getLoggedInUser = () => loggedInUser;

export const signInWithGooglePopup = () => signInWithPopup(auth, provider);