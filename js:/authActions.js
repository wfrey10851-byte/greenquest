// authActions.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

window.signup = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

window.login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

window.googleLogin = () =>
  signInWithPopup(auth, provider);

window.logout = () =>
  signOut(auth);
