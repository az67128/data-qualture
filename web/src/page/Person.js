import React from "react";
import Fab from "../component/Fab";
import AddIcon from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import { ajax } from "../helper/common";
import QueryTable from "../component/QueryTable";
import LinearProgress from "@material-ui/core/LinearProgress";
export default class MyDq extends React.Component {
  state = {
    query: [],
    personStat: {},
    isLoading: false
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    this.getQueryList();
  }

  render() {
    const { isLoading, query, personStat } = this.state;
    return (
      <div>
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Typography variant="h5" className="headline">
          Data Quality{" "}
          {personStat.person_name && " for " + personStat.person_name}
        </Typography>

        <QueryTable data={query} />

        <Fab linkTo="/editquery">
          <AddIcon />
        </Fab>
      </div>
    );
  }
  getQueryList = () => {
    this.setState({ isLoading: true });
    Promise.all([
      ajax({
        sp: "get_query_list_by_person",
        person_id: this.props.match.params.person_id
      }).then(data => {
        this.setState({
          query: data
        });
      }),
      ajax({
        sp: "get_person_list_with_stat",
        person_id: this.props.match.params.person_id
      }).then(data => {
        this.setState({
          personStat: data[0]
        });
      })
    ]).then(() => {
      this.setState({ isLoading: false });
    });
  };
}
