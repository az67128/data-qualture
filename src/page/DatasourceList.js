import React from "react";
import Paper from "@material-ui/core/Paper";
import Fab from "../component/Fab";
import AddIcon from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import EditDatasource from "./EditDatasource";
import { ajax } from "../helper/common";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import StarIcon from "@material-ui/icons/Star";

export default class DatasourceList extends React.Component {
  state = {
    isEditOpen: false,
    isLoading: false,
    datasource: [],
    editItem: 0
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    this.getDatasourceList();
  }
  render() {
    const { isEditOpen, isLoading, datasource, editItem } = this.state;
    return (
      <div>
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Typography variant="headline" className="headline">
          Datasources
        </Typography>

        <Paper>
          <List component="nav">
            {datasource.map(item => {
              return (
                <ListItem
                  button
                  key={item.datasource_id}
                  onClick={() => this.openEdit(item)}
                >
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText
                    inset
                    primary={item.datasource_name}
                    secondary={item.datasource_description}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
        <Fab onClick={this.openEdit}>
          <AddIcon />
        </Fab>
        {isEditOpen && (
          <EditDatasource
            isOpen={isEditOpen}
            handleClose={this.closeEdit}
            editItem={editItem}
          />
        )}
      </div>
    );
  }
  getDatasourceList = () => {
    this.setState({ isLoading: true });
    ajax({ sp: "get_datasource_list" }).then(data => {
      this.setState({
        datasource: data,
        isLoading: false
      });
    });
  };
  closeEdit = (needUpdate = false) => {
    this.setState({ isEditOpen: false, editId: 0 });
    if (needUpdate) {
      this.getDatasourceList();
    }
  };
  openEdit = datasource_id => {
    this.setState({ isEditOpen: true, editItem: datasource_id });
  };
}
