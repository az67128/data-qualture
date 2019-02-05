import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import { ajax, dispathSnackbarMessage } from "../helper/common";
import LinearProgress from "@material-ui/core/LinearProgress";
const styles = {
  appBar: {
    position: "relative"
  },
  flex: {
    flex: 1
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class EditTarget extends React.Component {
  state = {
    isModified: false,
    target: {
      target_id: 0,
      target_name: "",
      connection_type_id: "",
      target_description: "",
      config: ""
    },
    connection_type: [],
    isLoading: true,
    isFormChecke: false
  };
  componentDidMount() {
    Promise.all([this.getConnectionType(), this.getTarget()]).then(() => {
      this.setState({ isLoading: false });
    });
  }
  render() {
    const { classes, isOpen, handleClose } = this.props;
    const {
      target,
      isModified,
      connection_type,
      isLoading,
      isFormChecked
    } = this.state;
    const exampleConfig = !target.config
      ? connection_type.reduce((result, item) => {
          return target.connection_type_id === item.connection_type_id
            ? item.config_example
            : result;
        }, "{}")
      : null;

    return (
      <div>
        <Dialog
          fullScreen
          open={isOpen}
          onClose={handleClose}
          TransitionComponent={Transition}
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton
                color="inherit"
                onClick={handleClose}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" className={classes.flex}>
                Edit target
              </Typography>
              {isModified && (
                <Button color="inherit" onClick={this.saveTarget}>
                  save
                </Button>
              )}
            </Toolbar>
          </AppBar>
          {isLoading && <LinearProgress />}
          <div className="paper">
            <TextField
              fullWidth
              required
              error={isFormChecked && !target.target_name}
              label="Target name"
              value={target.target_name}
              onChange={this.handleChange("target_name")}
            />
            <FormControl
              required
              error={isFormChecked && !target.connection_type_id}
              fullWidth
              margin="normal"
            >
              <InputLabel htmlFor="datasource">Connection type</InputLabel>
              <Select
                value={target.connection_type_id}
                onChange={this.handleChange("connection_type_id")}
                name="connection_type_id"
                inputProps={{
                  id: "connection_type_id"
                }}
              >
                {connection_type.map(item => {
                  return (
                    <MenuItem
                      key={item.connection_type_id}
                      value={item.connection_type_id}
                    >
                      {item.connection_name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={target.target_description}
              onChange={this.handleChange("target_description")}
            />
            <TextField
              required
              error={isFormChecked && !target.config}
              fullWidth
              margin="normal"
              multiline={true}
              rowsMax={10}
              label="Configuration"
              value={target.config ? target.config : exampleConfig}
              onChange={this.handleChange("config")}
            />
          </div>
        </Dialog>
      </div>
    );
  }
  saveTarget = () => {
    const { target } = this.state;
    if (!target.target_name || !target.connection_type_id || !target.config) {
      this.setState({ isFormChecked: true });
      return;
    }
    this.setState({ isoading: true });
    ajax({
      sp: "update_target",
      remote_user: true,
      ...this.state.target
    })
      .then(data => {
        this.setState({ isoading: false });
        this.props.handleClose(true);
      })
      .catch(err => {
        dispathSnackbarMessage("Not authoized");
        this.setState({ isLoading: false });
      });
  };
  getConnectionType = () => {
    ajax({ sp: "get_connection_type_list" }).then(data => {
      this.setState({ connection_type: data });
    });
  };
  getTarget = () => {
    if (this.props.editTargetId !== 0) {
      return ajax({
        sp: "get_target",
        target_id: this.props.editTargetId,
        remote_user: true
      })
        .then(data => {
          this.setState({ target: data[0] });
          return;
        })
        .catch(err => {
          dispathSnackbarMessage("Not authoized");
          this.setState({ isLoading: false });
        });
    }
    return;
  };

  handleChange = property => event => {
    const value = event.target.value;
    this.setState(prevState => {
      return {
        isModified: true,
        target: { ...prevState.target, [property]: value }
      };
    });
  };
}
export default withStyles(styles)(EditTarget);
