import firebase from "firebase/app";
import "firebase/firestore";
import "babel-polyfill";

let config = {
  apiKey: "AIzaSyDDYIC0xKBi1EGl5WYtbVFkQflyE2O2i34",
  authDomain: "realtime-collaboration-talk.firebaseapp.com",
  databaseURL: "https://realtime-collaboration-talk.firebaseio.com",
  projectId: "realtime-collaboration-talk",
  storageBucket: "realtime-collaboration-talk.appspot.com",
  messagingSenderId: "949007853547"
};
let timeIndex = 0;
async function demo() {
  const BACKSPACE = 8;
  let lastStatePosition = -1;
  let p = document.body.querySelector("p");

  let app = firebase.initializeApp(config);
  let store = app.firestore();
  let crdtRoot = store.collection("talk").doc("crdt");

  let initialSnapshot = await crdtRoot.collection("states").get();
  let initialStates = [];
  initialSnapshot.forEach((state) => {
    initialStates.push(state.data());
  });
  let state = reduce(initialStates);

  p.innerText = textOf(state);
  timeIndex = timeIndexOf(state);

  p.parentElement.addEventListener("keydown",
    (ev) => {
      if(ev.keyCode === BACKSPACE && lastStatePosition >= 0) {
        state[lastStatePosition] = { deleted: true, timeIndex };
        lastStatePosition--;
      } else if (ev.key.length === 1) {
        lastStatePosition++;
        state[lastStatePosition] = { text: ev.key, timeIndex };
      }
      timeIndex = timeIndex + 1;
      crdtRoot.collection("states").add(state);
      p.innerText = textOf(state);
    }
  );
  crdtRoot.collection("states").where("pos", ">=", "0").onSnapshot(
    (snapshot) => {
      let states = [];
      snapshot.forEach((state) => states.push(state));
      states.push(state);
      state = reduce(states);
      timeIndex = timeIndexOf(state) + 1;
    }
  );
}

function textOf(state) {
  let text = "";
  Object.keys(state).forEach((key) => {
    if(!state[key].deleted) {
      text = text + state[key].text;
    }
  });
  return text;
}


function timeIndexOf(state) {
  let maxTime = 0;
  Object.keys(state).forEach(
    (pos) => maxTime = maxTime > state[pos].timeIndex ? maxTime : state[pos.timeIndex]
  );
  return maxTime;
}


function reduce(states) {
  let reduced= {};
  states.forEach(
    (state) => {
      Object.keys(state).forEach(
        (pos) => {
          if(!reduced[pos] || (reduced[pos].timeIndex < state[pos].timeIndex)) {
            reduced[pos] = state[pos];
          } else if (reduced[pos].timeIndex === state[pos].timeIndex) {
            if(reduced[pos].deleted) {
              reduced[pos] = state[pos];
            } else {
              reduced[pos] = Object.assign(reduced[pos], {text: reduced[pos].text + state[pos].text});
            }
          }
        }
      )
    }
  );
  return reduced;
}

demo();
