import firebase from "firebase/app";
import "firebase/firestore";

var config = {
  apiKey: "AIzaSyDDYIC0xKBi1EGl5WYtbVFkQflyE2O2i34",
  authDomain: "realtime-collaboration-talk.firebaseapp.com",
  databaseURL: "https://realtime-collaboration-talk.firebaseio.com",
  projectId: "realtime-collaboration-talk",
  storageBucket: "realtime-collaboration-talk.appspot.com",
  messagingSenderId: "949007853547"
};

function demo() {
  let p = document.body.querySelector("p");
  let app = firebase.initializeApp(config);
  let store = app.firestore();
  store.collection("talk").doc("test").onSnapshot(
    (snapshot) => {
      p.innerText = snapshot.data().data;
    }
  );
}

demo();
