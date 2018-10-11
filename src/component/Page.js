import React from "react"
import { Switch, Route } from "react-router-dom"
import Index from "../page/Index"
import Query from "../page/Query"
import MyDq from "../page/MyDq"
import QueryList from "../page/QueryList"
import EditQuery from "../page/EditQuery"
import TargetList from "../page/TargetList"
import DatasourceList from "../page/DatasourceList"
import Profile from "../page/Profile"
import Team from "../page/Team"
import Datasource from "../page/Datasource"
import Login from "../page/Login"

export default class Page extends React.Component {
  render() {
    const { login, logout, user } = this.props
    return (
      <main className="page">
        <Switch>
          <Route exact path="/" component={Index} />
          <Route path="/query/:q_id" component={Query} />
          <Route
            exact
            path="/mydq"
            render={() => {
              return <MyDq user={user} />
            }}
          />
          <Route path="/mydq/:person_id" component={MyDq} />
          <Route path="/querylist" component={QueryList} />
          <Route exact path="/editquery" component={EditQuery} />
          <Route path="/editquery/:q_id" component={EditQuery} />
          <Route path="/targetlist" component={TargetList} />
          <Route path="/datasourcelist" component={DatasourceList} />
          <Route
            path="/login"
            render={() => {
              return <Login login={login} user={user} />
            }}
          />
          <Route
            path="/profile"
            render={() => {
              return <Profile logout={logout} user={user} />
            }}
          />
          <Route path="/datasource/:datasource_id" component={Datasource} />
          <Route exact path="/datasource" component={Datasource} />
          <Route path="/team/:person_id" component={Team} />
          <Route exact path="/team" component={Team} />
        </Switch>
      </main>
    )
  }
}
