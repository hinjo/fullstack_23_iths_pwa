// import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
// import useWebSocket from "react-use-websocket";

const webSocket = new WebSocket("ws://localhost:8082");

// moved within App
// webSocket.addEventListener("message", (event) => {
//   // document.querySelector("#time").textContent = event.data;
//   console.log(event.data);
// });

webSocket.addEventListener("open", (event) => {
  webSocket.send("hinjo");
});

function App() {
  const [nickname, setNickname] = useState("hinjo");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  // useWebSocket("ws://127.0.0.1:8082", {
  //   onOpen: () => {
  //     console.log("WebSocket connection established.");
  //   },
  // });

  function getProfile() {
    // setNickname(prompt("Enter your nickname: "));

    webSocket.addEventListener("message", (event) => {
      // document.querySelector("#time").textContent = event.data;
      console.log(event.data);
      if (event.data === "new posts available") {
        fetchPosts();
      } else {
        console.log("no new posts available");
      }
    });

    if (nickname !== null && nickname !== "") {
      // fetch("/" + nickname)
      fetch("http://localhost:8081/" + nickname)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);

          setProfile(data[0]);
        });
    }
  }

  function fetchPosts() {
    console.log("fetching posts...");
    if (profile !== null) {
      // fetch("/posts/" + profile.id)
      fetch("http://localhost:8081/posts/" + profile.id)
        .then((response) => {
          console.log(response);
          return response.json();
        })
        .then((result) => {
          console.log(result);
          setPosts(result);
        });
    } else {
      console.log("profile is null");
    }
  }

  useEffect(getProfile, []);
  useEffect(fetchPosts, [profile]);

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Hej
          {profile !== null && profile !== {} && profile.name !== undefined
            ? " " + profile.name + " " + profile.lastname
            : " Stranger"}
        </p>
        <h1>Your posts:</h1>
        {posts !== null && posts.length !== []
          ? posts.map((value, index) => <p key={index}> {value.post}</p>)
          : ""}
        {/* <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      </header>
    </div>
  );
}

export default App;
