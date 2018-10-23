import React from "react"
import "../css/datasourcestat.css"
import Typography from "@material-ui/core/Typography"
import StatGrid from "../component/StatGrid"
import { ajax } from "../helper/common"
import LinearProgress from "@material-ui/core/LinearProgress"

export default class Team extends React.Component {
  state = {
    isLoading: false,
    personList: []
  }
  render() {
    const { isLoading, personList } = this.state
    return (
      <div className="overflowHidden">
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Typography variant="headline" className="headline">
          Team
        </Typography>
        <StatGrid
          withAvatar={true}
          pictureProp="picture_link"
          data={personList}
          idPropName="person_id"
          nameProp="person_name"
          chartDataSp="get_person_error_chart"
          entity="person"
        />
      </div>
    )
  }
  componentDidMount() {
    this.getPersonList()
  }

  getPersonList = () => {
    this.setState({ isLoading: true })
    ajax({ sp: "get_person_list_with_stat" }).then(data => {
      this.setState({ personList: data, isLoading: false })
    })
  }
}
