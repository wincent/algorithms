const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();

const state = {
  sequence: -1,
  show: null,
  status: "inactive",
  questions: fs
    .readdirSync(path.join(__dirname, "samples"))
    .sort((a, b) => {
      return a.replace(/\D+/g, "") - b.replace(/\D+/g, "");
    })
    .map((entry) => {
      if (entry.endsWith(".js.txt")) {
        const [metadata] = fs
          .readFileSync(path.join(__dirname, "samples", entry), "utf8")
          .split("---");

        return question(JSON.parse(metadata));
      }
    })
    .filter(Boolean),
};

let networkState;

updateState();

/**
 * Assigns an updated a copy of the state to `networkState`, where the
 * set of voter IDs has been replaced by a count of voters.
 */
function updateState() {
  state.sequence++;

  networkState = {
    ...state,
    questions: state.questions.map((question) => {
      return {
        ...question,
        options: question.options.map(({ id, votes, text }) => {
          return {
            id,
            text,
            votes: votes.size,
          };
        }),
      };
    }),
  };
}

function question({ heading, options }) {
  return {
    status: "closed",
    heading,
    options: options.map((text, index) => {
      return {
        id: String.fromCharCode(index + 97), // ie. 0 -> "a", 1 -> "b" etc
        text,
        votes: new Set(),
      };
    }),
  };
}

app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/poll", function (req, res) {
  if (
    req.query.sequence &&
    parseInt(req.query.sequence, 10) === state.sequence
  ) {
    res.json({ sequence: state.sequence });
  } else {
    res.json(networkState);
  }
});

// curl \
//   -X POST \
//   -H 'Content-Type: application/json' \
//   -d '{"yo":"hi"}' \
//   http://localhost:9000/vote
//
app.post("/vote", function (req, res) {
  try {
    const { question, user, choice } = req.body;

    if (
      state.status === "active" &&
      state.show === question &&
      state.questions[question].status === "open" &&
      user
    ) {
      state.questions[question].options.forEach(({ id, votes }) => {
        if (id === choice) {
          console.log(
            `/vote question=${question} choice=${choice} user=${user}`
          );

          votes.add(user);
        } else {
          votes.delete(user);
        }
      });

      updateState();
    }

    res.json({ error: null });
  } catch {
    res.json({ error: "Bad request" });
  }
});

app.post("/admin", function (req, res) {
  try {
    const { command, secret } = req.body;

    if (secret !== "hunter2") {
      throw new Error("Forbidden");
    }

    switch (command) {
      case "close":
      case "finalize":
      case "open":
      case "reset":
      case "show":
        const question = parseInt(req.body.question, 10);

        if (
          isNaN(question) ||
          question < 0 ||
          question > state.questions.length - 1
        ) {
          throw new Error("Bad question");
        }

        if (command === "close") {
          state.questions[question].status = "closed";
        } else if (command === "finalize") {
          state.questions[question].status = "finalized";
        } else if (command === "open") {
          state.questions[question].status = "open";
        } else if (command === "reset") {
          state.questions[question].options.forEach(({ votes }) => {
            votes.clear();
          });
        } else if (command === "show") {
          state.show = question;
        }

        state.status = "active";
        break;

      default:
        throw new Error("Unknown command");
    }

    updateState();

    res.json({ error: null });
  } catch {
    res.json({ error: "Bad request" });
  }
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(9000);
