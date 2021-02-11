import { useEffect, useRef, useState } from "react";

import LinearProgress from "@material-ui/core/LinearProgress";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import MobileStepper from "@material-ui/core/MobileStepper";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const MIME_TYPES = {
  plain: /^text\/plain\b/,
};

// Not a real UUID, but it will do.
const UUID = "00000000-0000-0000-0000-000000000000".replace(/\d/g, () => {
  return "0123456789abcdef".split("")[Math.floor(Math.random() * 15)];
});

function vote(question, option) {
  const body = { question, user: UUID, choice: option };
  fetch("/vote", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch((error) => {
    // Engage the silent drive!
  });
}

function VotingPane({ state }) {
  const classes = useStyles();

  const [value, setValue] = useState(null);

  const [code, setCode] = useState("...");

  const loading = useRef(state.show);

  const votes = useRef([]);

  useEffect(() => {
    if (state.show != null && loading.current !== state.show) {
      loading.current = state.show;

      setValue(votes.current[state.show] || null);
      setCode("// loading...");

      fetch(`/samples/sample-${loading.current}.js.txt`)
        .then((response) => {
          const contentType = response.headers.get("Content-Type");
          if (!contentType || !MIME_TYPES.plain.test(contentType)) {
            throw new Error(`Unexpected Content-Type ${contentType}`);
          }
          return response.text();
        })
        .then((text) => {
          if (loading.current === state.show) {
            setCode(text);
          }
        })
        .catch((text) => setCode("// failed to load..."));
    }
  }, [state.show]);

  const handleChange = (event) => {
    const option = event.currentTarget.value;
    setValue(option);
    vote(state.show, option);
    votes.current[state.show] = option;
  };

  if (
    state.status === "inactive" ||
    state.show === null ||
    state.questions.length === 0
  ) {
    return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>Waiting to begin...</Paper>
          </Grid>
        </Grid>
      </div>
    );
  }

  const question = state.questions[state.show];
  let totalVotes = 0;
  const MIN = 0;
  const MAX = question.options.reduce((acc, { votes }) => {
    totalVotes += votes;
    return Math.max(votes, acc);
  }, 0);
  const normalize = (value) => {
    return ((value - MIN) * 100) / (MAX - MIN);
  };

  return (
    <>
      <Box display="flex" justifyContent="center">
        <MobileStepper
          variant="dots"
          steps={state.questions.length}
          position="static"
          activeStep={state.show}
        />
      </Box>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper} elevation={3}>
              <span dangerouslySetInnerHTML={{ __html: question.heading }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Paper elevation={3}>
              <Box p={2}>
                <Code code={code} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper className={classes.paper} elevation={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Votes: {totalVotes}</FormLabel>
                <RadioGroup
                  aria-label="vote"
                  name="vote"
                  value={value}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="a"
                    disabled={question.status !== "open"}
                    control={<Radio />}
                    label={question.options[0].text}
                  />
                  {question.status === "finalized" ? (
                    <LinearProgress
                      variant="determinate"
                      title={`Votes: ${question.options[0].votes}`}
                      value={normalize(question.options[0].votes)}
                    />
                  ) : null}
                  <FormControlLabel
                    value="b"
                    disabled={question.status !== "open"}
                    control={<Radio />}
                    label={question.options[1].text}
                  />
                  {question.status === "finalized" ? (
                    <LinearProgress
                      variant="determinate"
                      title={`Votes: ${question.options[1].votes}`}
                      value={normalize(question.options[1].votes)}
                    />
                  ) : null}
                  <FormControlLabel
                    value="c"
                    disabled={question.status !== "open"}
                    control={<Radio />}
                    label={question.options[2].text}
                  />
                  {question.status === "finalized" ? (
                    <LinearProgress
                      variant="determinate"
                      title={`Votes: ${question.options[2].votes}`}
                      value={normalize(question.options[2].votes)}
                    />
                  ) : null}
                  <FormControlLabel
                    value="d"
                    disabled={question.status !== "open"}
                    control={<Radio />}
                    label={question.options[3].text}
                  />
                  {question.status === "finalized" ? (
                    <LinearProgress
                      variant="determinate"
                      title={`Votes: ${question.options[3].votes}`}
                      value={normalize(question.options[3].votes)}
                    />
                  ) : null}
                </RadioGroup>
              </FormControl>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  );
}

function Code({ code }) {
  // eslint-disable-next-line no-undef
  const html = hljs.highlight("javascript", code).value;

  return (
    <pre style={{ overflowX: "auto" }}>
      <code className="javascript" dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

export default VotingPane;
