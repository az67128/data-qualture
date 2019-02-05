import React from "react";
import DatasourceChart from "../component/DatasourceChart";

import BurndownChart from "../component/BurndownChart";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { ajax } from "../helper/common";
import LinearProgress from "@material-ui/core/LinearProgress";
import TextField from "@material-ui/core/TextField";
import "../css/indexpage.css";
export default class Index extends React.Component {
  state = {
    datasource_error_chart: [],
    burndown_error_chart: [],
    isLoading: false,
    start_date: "",
    end_date: ""
  };
  render() {
    const {
      datasource_error_chart,
      burndown_error_chart,
      isLoading,
      start_date,
      end_date
    } = this.state;
    return (
      <div className="indexPage">
        {isLoading && <LinearProgress className="fixedProgress" />}
        <div className="header">
          <Typography variant="h5" className="headline">
            Data quality trend
          </Typography>
          <div className="datePick">
            <TextField
              className="picker"
              label="Start date"
              onChange={this.handleChange("start_date")}
              type="date"
              value={start_date}
            />
            <TextField
              label="End date"
              className="picker"
              onChange={this.handleChange("end_date")}
              type="date"
              value={end_date}
            />
          </div>
        </div>
        <Paper className="paper">
          <DatasourceChart data={datasource_error_chart} />
        </Paper>

        <Typography variant="h5" className="headline">
          Burndown chart
        </Typography>
        <Paper className="paper">
          <BurndownChart data={burndown_error_chart} />
        </Paper>
      </div>
    );
  }
  componentDidMount() {
    window.scrollTo(0, 0);
    this.setDefaultDate();
    setTimeout(this.getDatasourceChart, 100);
  }
  getDatasourceChart = () => {
    this.setState({ isLoading: true });
    Promise.all([
      ajax({
        sp: "get_datasource_error_chart",
        start_date: this.state.start_date,
        end_date: this.state.end_date
      }).then(data => {
        this.setState({
          datasource_error_chart: data,
          isLoading: false
        });
      }),
      ajax({
        sp: "get_burndown_chart",
        start_date: this.state.start_date,
        end_date: this.state.end_date
      }).then(data => {
        this.setState({
          burndown_error_chart: data,
          isLoading: false
        });
      })
    ]).then(() => {
      this.setState({
        isLoading: false
      });
    });
  };
  setDefaultDate = () => {
    let start_date = new Date();
    start_date.setMonth(start_date.getMonth() - 1);
    this.setState({
      start_date: start_date.toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10)
    });
  };
  handleChange = prop => event => {
    const value = event.target.value;
    this.setState({
      [prop]: value
    });
    setTimeout(this.getDatasourceChart, 100);
  };
}
