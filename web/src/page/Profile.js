import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Spacer from "../component/Spacer";
import { ajax } from "../helper/common";
import Button from "@material-ui/core/Button";
import { Redirect } from "react-router-dom";

export default class Login extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  render() {
    if (!this.props.user) {
      return <Redirect to="/login" />;
    }

    return (
      <div>
        <Typography variant="h5" className="headline">
          Profile
        </Typography>
        <Paper className="paper center">
          <Spacer />
          <Button
            variant="contained"
            color="primary"
            onClick={this.props.logout}
          >
            Logout
          </Button>
          <Spacer />
        </Paper>
      </div>
    );
  }
}
