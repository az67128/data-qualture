import React from "react"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import Spacer from "../component/Spacer"
import { ajax } from "../helper/common"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"

import LinearProgress from "@material-ui/core/LinearProgress"
import { sha256 } from "js-sha256"
import { Redirect } from "react-router-dom"
export default class Login extends React.Component {
  state = {
    isRegistring: false,
    isLoading: false,
    user: {
      email: "",
      password: "",
      name: ""
    }
  }
  render() {
    const { isRegistring, user, isLoading } = this.state
    if (this.props.user) {
      return <Redirect to="/mydq" />
    }
    return (
      <div>
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Typography variant="headline" className="headline">
          Login
        </Typography>
        <Paper className="paper center">
          <div>
            <TextField
              label="Email"
              value={user.email}
              onChange={this.handleChange("email")}
            />
          </div>
          <div>
            <TextField
              label="Password"
              type="password"
              margin="normal"
              value={user.password}
              onChange={this.handleChange("password")}
            />
          </div>
          {isRegistring && (
            <div>
              <div>
                <TextField
                  label="Name"
                  margin="normal"
                  value={user.name}
                  onChange={this.handleChange("name")}
                />
              </div>
            </div>
          )}
          <Spacer />
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.login(isRegistring, "password")}
          >
            {isRegistring ? "Register" : "Login"}
          </Button>
          <Spacer />

          {isRegistring ? (
            <Typography variant="caption">
              Already registred?
              <Button color="primary" size="small" onClick={this.swithLogin}>
                Sing in
              </Button>
            </Typography>
          ) : (
            <div>
              <Typography variant="caption">
                Do not have an account?
                <Button color="primary" size="small" onClick={this.swithLogin}>
                  Register
                </Button>
              </Typography>
              <Typography variant="caption">
                Corporate user?
                <Button
                  color="primary"
                  size="small"
                  onClick={() => this.login(isRegistring, "sspi")}
                >
                  Use sso
                </Button>
              </Typography>
            </div>
          )}
        </Paper>
      </div>
    )
  }
  componentDidMount() {
    window.scrollTo(0, 0)
  }
  swithLogin = () => {
    this.setState(prevState => {
      return { isRegistring: !prevState.isRegistring }
    })
  }
  login = (isRegistring, provider) => {
    this.setState({ isLoading: true })

    const { user } = this.state
    const loginParams = {}
    if (provider === "password") {
      loginParams.login = user.email
      loginParams.password_hash = sha256(user.password)
    }
    //register if new user
    new Promise((resolve, reject) => {
      if (!isRegistring) {
        resolve(true)
        return
      }
      ajax({
        sp: "register_user",
        provider: "password",
        person_name: user.name,
        email: user.email,
        login: user.email,
        password_hash: sha256(user.password)
      }).then(result => {
        if (result[0] && result[0].result === "User created") {
          resolve(true)
        } else {
          reject(result[0].result)
        }
      })
    })
      .then(result => {
        return ajax(
          {
            sp: "login",
            provider: provider,
            ...loginParams
          },
          { path: "auth" }
        ).then(data => {
          this.props.login()
          this.setState({ isLoading: false })
        })
      })
      .catch(err => {
        this.setState({ isLoading: false })
        setTimeout(() => console.log(err), 100)
      })
  }
  handleChange = property => event => {
    const value = event.target.checked
      ? event.target.checked
      : event.target.value
    this.setState(prevState => {
      return {
        user: { ...prevState.user, [property]: value }
      }
    })
  }
}
