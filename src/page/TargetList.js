import React from "react";
import Paper from "@material-ui/core/Paper";
import Fab from "../component/Fab";
import AddIcon from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import EditTarget from "./EditTarget";
import { ajax } from "../helper/common";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import StarIcon from "@material-ui/icons/Star";

export default class TargetList extends React.Component {
  state = {
    isEditOpen: false,
    isLoading: false,
    target: [],
    editTargetId: 0
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    this.getTargetList();
  }
  render() {
    const { isEditOpen, isLoading, target, editTargetId } = this.state;
    return (
      <div>
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Typography variant="headline" className="headline">
          Targets
        </Typography>

        <Paper>
          <List component="nav">
            {target.map(item => {
              return (
                <ListItem
                  button
                  key={item.target_id}
                  onClick={() => this.openEdit(item.target_id)}
                >
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText
                    inset
                    primary={item.target_name}
                    secondary={item.target_description}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
        <Fab onClick={() => this.openEdit(0)}>
          <AddIcon />
        </Fab>
        {isEditOpen && (
          <EditTarget
            isOpen={isEditOpen}
            handleClose={this.closeEdit}
            editTargetId={editTargetId}
          />
        )}
      </div>
    );
  }
  getTargetList = () => {
    this.setState({ isLoading: true });
    ajax({ sp: "get_target_list" }).then(data => {
      this.setState({
        target: data,
        isLoading: false
      });
    });
  };
  closeEdit = (needUpdate = false) => {
    this.setState({ isEditOpen: false, editTargetId: 0 });
    if (needUpdate) {
      this.getTargetList();
    }
  };
  openEdit = target_id => {
    this.setState({ isEditOpen: true, editTargetId: target_id });
  };
}
