// frontend/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyABX_jzFXSC5XB5rvrVS41xdJLxtLVzeA8",
  authDomain: "wanderwise-709f3.firebaseapp.com",
  projectId: "wanderwise-709f3",
  storageBucket: "wanderwise-709f3.appspot.com",
  messagingSenderId: "225681214944",
  appId: "1:225681214944:web:483cabc313ec427833ef85"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }
