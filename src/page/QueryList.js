import React from "react"
import Fab from "../component/Fab"
import AddIcon from "@material-ui/icons/Add"
import Typography from "@material-ui/core/Typography"
import { ajax } from "../helper/common"
import QueryTable from "../component/QueryTable"
import LinearProgress from "@material-ui/core/LinearProgress"
export default class QueryList extends React.Component {
  state = {
    query: [],
    isLoading: false
  }
  componentDidMount() {
    window.scrollTo(0, 0)
    this.getQueryList()
  }

  render() {
    const { isLoading, query } = this.state
    return (
      <div>
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Typography variant="headline" className="headline">
          Queries
        </Typography>

        <QueryTable data={query} />

        <Fab linkTo="/editquery">
          <AddIcon />
        </Fab>
      </div>
    )
  }
  getQueryList = () => {
    this.setState({ isLoading: true })
    ajax({ sp: "get_query_list" }).then(data => {
      this.setState({
        query: data,
        isLoading: false
      })
    })
  }
}
