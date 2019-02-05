import React from "react";
import Drawer from "@material-ui/core/Drawer";
import AppMenu from "./AppMenu";
export default class AppDrawer extends React.Component {
  render() {
    const { isOpen, toggleDrawer, user } = this.props;
    return (
      <Drawer open={isOpen} onClose={toggleDrawer}>
        <AppMenu toggleDrawer={toggleDrawer} user={user} />
      </Drawer>
    );
  }
}
