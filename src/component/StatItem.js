import React from "react";
import ErrorAvatar from "./ErrorAvatar";
import { ajax } from "../helper/common";
import ErrorChart from "./ErrorChart";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import PersonAvatar from "./PersonAvatar";
import Typography from "@material-ui/core/Typography";
export default class DatasourceStat extends React.Component {
  state = {
    isChartLoading: false,
    error_chart: []
  };
  render() {
    const {
      item_id,
      name,
      query_count,
      error_count,
      error_delta,
      withAvatar,
      picture_link
    } = this.props;
    const { error_chart } = this.state;
    return (
      <Card>
        <CardHeader
          style={{ padding: "1rem" }}
          avatar={
            withAvatar && (
              <PersonAvatar
                color="primary"
                user={{
                  person_id: item_id,
                  person_name: name,
                  picture_link: picture_link
                }}
              />
            )
          }
          action={
            <ErrorAvatar error_count={error_count} error_delta={error_delta} />
          }
          title={<Typography variant="subheading">{name}</Typography>}
          subheader={
            <Typography variant="caption">
              {query_count + " quer"}
              {query_count == 1 ? "y" : "ies"}
            </Typography>
          }
        />
        <Divider />
        <CardContent style={{ padding: "0.5rem 0.1rem 0.1rem 0.1rem" }}>
          <ErrorChart data={error_chart} />
        </CardContent>
      </Card>
    );
  }
  componentDidMount() {
    this.getDatasourceChart();
  }
  getDatasourceChart = () => {
    this.setState({
      isChartLoading: true
    });
    ajax({
      sp: this.props.chartDataSp,
      [this.props.idPropName]: [this.props.item_id]
    }).then(data => {
      this.setState({ isChartLoading: false, error_chart: data });
    });
  };
}
