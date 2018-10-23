import React from "react"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import Divider from "@material-ui/core/Divider"
import DatasourceStatIcon from "@material-ui/icons/GolfCourse"
import TeamStatIcon from "@material-ui/icons/Group"
import QueryListIcon from "@material-ui/icons/ListAlt"
import MyDqIcon from "@material-ui/icons/Person"
import TargetIcon from "@material-ui/icons/Map"
import DatasourceIcon from "@material-ui/icons/Landscape"
import { Link } from "react-router-dom"

export default class AppMenu extends React.Component {
  render() {
    const { toggleDrawer, user } = this.props
    return (
      <div>
        <List component="nav">
          <ListItem
            button
            component={Link}
            to={"/querylist"}
            onClick={toggleDrawer}
          >
            <ListItemIcon>
              <QueryListIcon />
            </ListItemIcon>
            <ListItemText primary="Query list" />
          </ListItem>
          {user && (
            <ListItem
              button
              component={Link}
              to={"/person/" + user.user_id}
              onClick={toggleDrawer}
            >
              <ListItemIcon>
                <MyDqIcon />
              </ListItemIcon>
              <ListItemText primary="My Data Quality" />
            </ListItem>
          )}
        </List>

        <Divider />
        <List>
          <ListItem
            button
            component={Link}
            to={"/datasource"}
            onClick={toggleDrawer}
          >
            <ListItemIcon>
              <DatasourceStatIcon />
            </ListItemIcon>
            <ListItemText primary="Datasource stat" />
          </ListItem>
          <ListItem button component={Link} to={"/team"} onClick={toggleDrawer}>
            <ListItemIcon>
              <TeamStatIcon />
            </ListItemIcon>
            <ListItemText primary="Team stat" />
          </ListItem>
        </List>
        <Divider />
        <ListItem
          button
          component={Link}
          to={"/targetlist"}
          onClick={toggleDrawer}
        >
          <ListItemIcon>
            <TargetIcon />
          </ListItemIcon>
          <ListItemText primary="Targets" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to={"/datasourcelist"}
          onClick={toggleDrawer}
        >
          <ListItemIcon>
            <DatasourceIcon />
          </ListItemIcon>
          <ListItemText primary="Datasources" />
        </ListItem>
      </div>
    )
  }
}
