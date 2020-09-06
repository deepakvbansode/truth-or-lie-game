import firebase from "firebase";

const config = {
  apiKey: "AIzaSyDb2HjIn9n3E3voLC04pXzBf5yuaQQAKA4",
  authDomain: "truth-or-lie-22542.firebaseapp.com",
  databaseURL: "https://truth-or-lie-22542.firebaseio.com",
};

firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();
