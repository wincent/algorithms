import { Button, ButtonGroup } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { useEffect, useRef, useState } from "react";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

function command(action, question) {
  const body = { command: action, question, secret: "hunter2" };
  fetch("/admin", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.error) {
        console.error(response.error);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function AdminPane({ state }) {
  const classes = useStyles();

  const [shown, setShown] = useState(null);

  const rows = state.questions;

  const show = (index) => {
    setShown(index);
    command("show", index);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Active?</TableCell>
              <TableCell>Example #</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">A</TableCell>
              <TableCell align="right">B</TableCell>
              <TableCell align="right">C</TableCell>
              <TableCell align="right">D</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.heading}>
                <TableCell>
                  <Radio
                    checked={shown === index}
                    onChange={() => show(index)}
                    name="radio-button-demo"
                  />
                </TableCell>
                <TableCell component="th" scope="row">
                  {index}
                </TableCell>
                <TableCell>
                  <span dangerouslySetInnerHTML={{ __html: row.heading }} />
                </TableCell>
                <TableCell align="right">{row.options[0].votes}</TableCell>
                <TableCell align="right">{row.options[1].votes}</TableCell>
                <TableCell align="right">{row.options[2].votes}</TableCell>
                <TableCell align="right">{row.options[3].votes}</TableCell>
                <TableCell>
                  <ButtonGroup>
                    <Button onClick={() => show(index)} variant="outlined">
                      Show
                    </Button>
                    <Button
                      onClick={() => command("open", index)}
                      variant="outlined"
                    >
                      Open
                    </Button>
                    <Button
                      onClick={() => command("close", index)}
                      variant="outlined"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => command("finalize", index)}
                      variant="outlined"
                    >
                      Finalize
                    </Button>
                    <Button
                      onClick={() => command("reset", index)}
                      variant="outlined"
                    >
                      Reset
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default AdminPane;
