import React from "react"
import AppBar from "./AppBar"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { theme, PRIMARY_COLOR } from "../constant/common"
import Page from "./Page"
import Drawer from "./Drawer"
import { isJwtExpired, decodeJwt } from "../helper/common"
import Snackbar from "@material-ui/core/Snackbar"
import Slide from "@material-ui/core/Slide"
export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isDrawerOpen: false,
      user: null,
      isSnackbarOpen: false,
      snackMessage: ""
    }
  }

  render() {
    const { isDrawerOpen, user, isSnackbarOpen, snackMessage } = this.state
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <AppBar toggleDrawer={this.toggleDrawer} user={user} />
          <Drawer
            toggleDrawer={this.toggleDrawer}
            isOpen={isDrawerOpen}
            user={user}
          />
          <Page login={this.login} logout={this.logout} user={user} />
        </div>
        <Snackbar
          autoHideDuration={3000}
          open={isSnackbarOpen}
          TransitionComponent={Slide}
          ContentProps={{
            "aria-describedby": "message-id"
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          style={{ backgroundColor: PRIMARY_COLOR }}
          variant="info"
          onClose={this.handleSnackbarClose}
          message={<span id="message-id">{snackMessage}</span>}
        />
      </MuiThemeProvider>
    )
  }
  logout = () => {
    this.setState({ user: null })
    localStorage.setItem("dqRefreshToken", "")
    //this.displayUser();
  }
  login = () => {
    this.displayUser()
  }
  displayUser = () => {
    const jwt = localStorage.getItem("dqRefreshToken")
    if (isJwtExpired(jwt)) return
    const decoded = decodeJwt(jwt)

    this.setState({
      user: {
        person_name: decoded.person_name,
        picture_link: decodeURIComponent(decoded.picture_link)
      }
    })
  }
  componentDidMount() {
    this.displayUser()
    window.addEventListener("snackBarMessage", this.snackBarMessage)
  }
  componentWillUnmount() {
    window.removeEventListener("snackBarMessage", this.snackBarMessage)
  }
  handleSnackbarClose = () => {
    this.setState({ isSnackbarOpen: false })
  }
  snackBarMessage = e => {
    this.setState({
      isSnackbarOpen: true,
      snackMessage: e.detail
    })
  }
  toggleDrawer = () => {
    this.setState(prevState => {
      return { isDrawerOpen: !prevState.isDrawerOpen }
    })
  }
}
