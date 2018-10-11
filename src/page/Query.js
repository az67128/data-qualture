import React from "react"
import Typography from "@material-ui/core/Typography"
import Spacer from "../component/Spacer"
import { ajax, dispathSnackbarMessage } from "../helper/common"
import Divider from "@material-ui/core/Divider"
import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import IconButton from "@material-ui/core/IconButton"
import { Link } from "react-router-dom"
import EditIcon from "@material-ui/icons/Edit"
import RefreshIcon from "@material-ui/icons/Loop"
import DownloadIcon from "@material-ui/icons/GetApp"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import LinearProgress from "@material-ui/core/LinearProgress"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import HelpIcon from "@material-ui/icons/Help"
import ErrorChart from "../component/ErrorChart"
import ResponsiblePeople from "../component/ResponsiblePeople"
import ErrorReport from "../component/ErrorReport"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import "../css/query.css"
export default class Query extends React.Component {
  state = {
    query: {
      query_name: "",
      query_description: "",
      query_justification: "",
      query_hint: "",
      datasource_name: "",
      responsible: null,
      accountable: null,
      informed: null
    },
    error_report: [],
    error_chart: [],
    isLoading: false,
    anchorEl: null
  }
  componentDidMount() {
    window.scrollTo(0, 0)
    this.getData()
  }
  render() {
    const { isLoading, query, error_report, error_chart, anchorEl } = this.state
    const isMenuOpen = Boolean(anchorEl)
    return (
      <div>
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Spacer />

        <Card>
          <CardHeader
            avatar={
              <div className="datasoureAvatar">
                <Typography>{query.datasource_name}</Typography>
                <Typography variant="caption" align="center">
                  {query.error_count} error{query.error_count == 1 ? "" : "s"}
                </Typography>
                <div className="rightDivider" />
              </div>
            }
            action={
              <IconButton onClick={this.openMenu}>
                <MoreVertIcon />
              </IconButton>
            }
            title={<Typography variant="title">{query.query_name}</Typography>}
            subheader={
              query.last_run && new Date(query.last_run).toLocaleString()
            }
          />
          <Divider />
          <CardContent>
            <Typography>{query.query_description}</Typography>
            <Typography variant="caption">
              {query.query_justification}
            </Typography>
          </CardContent>
          <Divider />
        </Card>
        <Spacer />
        <ResponsiblePeople
          responsible={query.responsible}
          accountable={query.accountable}
          informed={query.informed}
        />
        <ErrorReport
          error_report={error_report}
          executeQuery={this.executeQuery}
        />
        <Typography variant="headline" className="headline">
          Errors trend
        </Typography>

        <Card>
          <CardContent>
            <ErrorChart data={error_chart} legend={true} />
          </CardContent>
        </Card>
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={this.handleMenuClose}
        >
          <MenuItem
            onClick={this.handleClose}
            component={Link}
            to={"/editquery/" + this.props.match.params.q_id}
          >
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText inset primary="Edit" />
          </MenuItem>
          <MenuItem onClick={this.executeQuery}>
            <ListItemIcon>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText inset primary="Execute Query" />
          </MenuItem>
        </Menu>
      </div>
    )
  }
  openMenu = e => {
    this.setState({ anchorEl: e.currentTarget })
  }
  handleMenuClose = () => {
    this.setState({ anchorEl: null })
  }
  getData = () => {
    this.setState({ isLoading: true })
    Promise.all([
      this.getQuery(),
      this.getErrorReport(),
      this.getErrorChart()
    ]).then(result => {
      this.setState({
        isLoading: false
      })
    })
  }
  executeQuery = () => {
    this.setState({ isLoading: true, anchorEl: null })
    ajax(
      {
        query_id: this.props.match.params.q_id
      },
      { path: "execute" }
    )
      .then(() => {
        dispathSnackbarMessage("Query updated")
        this.getData()
      })
      .catch(err => {
        dispathSnackbarMessage("Query update failed")
        this.setState({ isLoading: false })
      })
  }
  getErrorReport = () => {
    return !this.props.match.params.q_id
      ? null
      : ajax({
          sp: "get_query_error",
          query_id: this.props.match.params.q_id
        }).then(data => {
          this.setState({ error_report: data })
        })
  }
  getErrorChart = () => {
    return !this.props.match.params.q_id
      ? null
      : ajax({
          sp: "get_query_error_chart",
          query_id: this.props.match.params.q_id
        }).then(data => {
          this.setState({ error_chart: data })
        })
  }
  getQuery = () => {
    return !this.props.match.params.q_id
      ? null
      : ajax({
          sp: "get_query",
          query_id: this.props.match.params.q_id
        }).then(data => {
          this.setState({
            query: {
              ...data[0],
              responsible: JSON.parse(data[0].responsible),
              accountable: JSON.parse(data[0].accountable),
              informed: JSON.parse(data[0].informed)
            }
          })
        })
  }
}
