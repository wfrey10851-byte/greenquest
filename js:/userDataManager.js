// userDataManager.js
import { auth, db, watchAuth } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class UserDataManager {
  constructor() {
    this.user = null;
    this.data = null;

    watchAuth(user => {
      if (user) {
        this.user = user;
        this.loadUserData();
      } else {
        this.user = null;
        this.data = null;
      }
    });
  }

  async loadUserData() {
    const ref = doc(db, "users", this.user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await this.initNewUser();
    } else {
      this.data = snap.data();
    }

    console.log("User data loaded:", this.data);
  }

  async initNewUser() {
    const ref = doc(db, "users", this.user.uid);
    this.data = {
      email: this.user.email,
      createdAt: Date.now(),
      level: 1,
      points: 0,
      questsCompleted: []
    };

    await setDoc(ref, this.data);
    console.log("New user initialized");
  }

  async updateData(updates) {
    if (!this.user) return;
    const ref = doc(db, "users", this.user.uid);

    await updateDoc(ref, updates);
    Object.assign(this.data, updates);
  }

  async resetUserData() {
    if (!this.user) return;
    await this.initNewUser();
  }
}

export const userDataManager = new UserDataManager();
