// Import stylesheets
import "./style.css";
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from "firebaseui";

// Document elements
const startRsvpButton = document.getElementById("startRsvp");
const guestbookContainer = document.getElementById("guestbook-container");

const form = document.getElementById("leave-message");
const input = document.getElementById("message");
const guestbook = document.getElementById("guestbook");
const numberAttending = document.getElementById("number-attending");
const rsvpYes = document.getElementById("rsvp-yes");
const rsvpNo = document.getElementById("rsvp-no");

var rsvpListener = null;
var guestbookListener = null;

// Add Firebase project configuration object here
// Setting konfigurasi firebase
const firebaseConfig = {
  apiKey: "AIzaSyCPUR-4IBVWH15Z_zTA_nIE0xYuI4_Va1k",
  authDomain: "fir-study-jam-medan.firebaseapp.com",
  databaseURL: "https://fir-study-jam-medan.firebaseio.com",
  projectId: "fir-study-jam-medan",
  storageBucket: "fir-study-jam-medan.appspot.com",
  messagingSenderId: "645832745544",
  appId: "1:645832745544:web:848cf3df7472769cec6e7d"
};

// Inisilalisasi aplikasi firebase dengan settingan yang sudah dimasukan
firebase.initializeApp(firebaseConfig);

// FirebaseUI config
// Configurasi User Interface yang diberikan Firabese
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

// Initialize the FirebaseUI widget using Firebase
// Inisialisasi settingan User Interface Firebase kedalam aplikasi kita
const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Listen to RSVP button clicks
// Called when the user clicks the RSVP button
// Event ketika tombol MOHON BALASANNYA / LOGOUT diklik
startRsvpButton.addEventListener("click", () => {
  /**
   * Cek apakah user sudah melakukan login atau tidak
   * jika user sudah login, maka user tidak perlu membuat ulang akun baru
   * jika user belum login, maka user harus membuat akun baru
   */
  if (firebase.auth().currentUser) {
    // User is signed in; allows user to sign out
    firebase.auth().signOut();
  } else {
    // No user is signed in; allows user to sign in
    ui.start("#firebaseui-auth-container", uiConfig);
  }
});

// Listen to the current Auth state
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    startRsvpButton.textContent = "LOGOUT";
    // Show guestbook to logged-in users
    guestbookContainer.style.display = "block";

    // Subscribe to the guestbook collection
    subscribeGuestbook();
  } else {
    startRsvpButton.textContent = "MOHON BALASANNYA";
    // Hide guestbook for non-logged-in users
    guestbookContainer.style.display = "none";

    // Unsubscribe from the guestbook collection
    unsubscribeGuestbook();
  }
});

// Listen to the form submission
form.addEventListener("submit", e => {
  // Prevent the default form redirect
  e.preventDefault();

  // Write a new message to the database collection "guestbook"
  firebase
    .firestore()
    .collection("guestbook")
    .add({
      text: input.value,
      timestamp: Date.now(),
      name: firebase.auth().currentUser.displayName,
      userId: firebase.auth().currentUser.uid
    });
  // clear message input field
  input.value = "";
  // Return false to avoid redirect
  return false;
});

// Listen to guestbook updates
function subscribeGuestbook() {
  // Create query for messages
  guestbookListener = firebase
    .firestore()
    .collection("guestbook")
    .orderBy("timestamp", "desc")
    .onSnapshot(snaps => {
      // Reset page
      guestbook.innerHTML = "";
      // Loop through documents in database
      snaps.forEach(doc => {
        // Create an HTML entry for each document and add it to the chat
        const entry = document.createElement("p");
        entry.textContent = doc.data().name + ": " + doc.data().text;
        guestbook.appendChild(entry);
      });
    });
}

// Unsubscribe from guestbook updates
function unsubscribeGuestbook() {
  if (guestbookListener != null) {
    guestbookListener();
    guestbookListener = null;
  }
}
