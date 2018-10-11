import React from "react";
import "../css/datasourcestat.css";
import Typography from "@material-ui/core/Typography";
import StatGrid from "../component/StatGrid";
import { ajax } from "../helper/common";
import LinearProgress from "@material-ui/core/LinearProgress";

export default class Datasource extends React.Component {
  state = {
    isLoading: false,
    datasourceList: []
  };
  render() {
    const { isLoading, datasourceList, xs } = this.state;
    return (
      <div className="overflowHidden">
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Typography variant="headline" className="headline">
          Datasources
        </Typography>
        <StatGrid
          data={datasourceList}
          idPropName="datasource_id"
          nameProp="datasource_name"
          chartDataSp="get_datasource_error_chart"
        />
      </div>
    );
  }
  componentDidMount() {
    this.getDatasourceList();
  }

  getDatasourceList = () => {
    this.setState({ isLoading: true });
    ajax({ sp: "get_datasource_list_with_stat" }).then(data => {
      this.setState({ datasourceList: data, isLoading: false });
    });
  };
}
