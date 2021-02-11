import { useEffect, useRef, useState } from "react";

import AdminPane from "./AdminPane";
import VotingPane from "./VotingPane";

import "./App.css";

function App() {
  const secret = new URLSearchParams(window.location.search).get("secret");

  const sequence = useRef(-1);

  const [state, setState] = useState({
    show: null,
    status: "inactive",
    questions: [],
  });

  useEffect(() => {
    const handle = setInterval(() => {
      fetch(`/poll?sequence=${sequence.current}`)
        .then((response) => response.json())
        .then((json) => {
          if (json.sequence > sequence.current) {
            sequence.current = json.sequence;
            setState({
              show: json.show,
              status: json.status,
              questions: json.questions,
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }, 1000);

    return () => clearInterval(handle);
  }, []);

  // Note: Plz dont h4xx0r me!

  if (secret === "hunter2") {
    return <AdminPane state={state} />;
  } else {
    return <VotingPane state={state} />;
  }
}

export default App;
