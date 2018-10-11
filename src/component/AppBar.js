import React from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { LOGO_IMG } from "../constant/common";
import { Link } from "react-router-dom";
import PersonAvatar from "./PersonAvatar";
const styles = {
  root: {
    flexGrow: 1,
    paddingBottom: "64px"
  },
  flex: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
};

function ButtonAppBar(props) {
  const { classes, toggleDrawer, user } = props;

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className="appBar">
        <Toolbar className="toolBar">
          <IconButton
            onClick={toggleDrawer}
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
          >
            <MenuIcon />
          </IconButton>
          <Link to="/">
            <img alt="" src={LOGO_IMG} className="logo" />
          </Link>
          <Typography variant="title" color="inherit" className={classes.flex}>
            Data Qualture
          </Typography>
          {user ? (
            <PersonAvatar user={user} />
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withStyles(styles)(ButtonAppBar);
