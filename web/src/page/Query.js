import React from "react"
import Typography from "@material-ui/core/Typography"
import Spacer from "../component/Spacer"
import { ajax, dispathSnackbarMessage } from "../helper/common"
import Divider from "@material-ui/core/Divider"
import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import { Link } from "react-router-dom"
import EditIcon from "@material-ui/icons/Edit"
import HelpIcon from "@material-ui/icons/Help"
import RefreshIcon from "@material-ui/icons/Loop"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import LinearProgress from "@material-ui/core/LinearProgress"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import ErrorChart from "../component/ErrorChart"
import ResponsiblePeople from "../component/ResponsiblePeople"
import ErrorReport from "../component/ErrorReport"
import Menu from "@material-ui/core/Menu"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
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
    anchorEl: null,
    isHintOpen: false
  }
  componentDidMount() {
    window.scrollTo(0, 0)
    this.getData()
  }
  render() {
    const {
      isLoading,
      query,
      error_report,
      error_chart,
      anchorEl,
      isHintOpen
    } = this.state
    const isMenuOpen = Boolean(anchorEl)
    return (
      <div>
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Spacer />

        <Card>
          <CardHeader
            avatar={
              <div className="datasoureAvatar">
                <Typography
                  style={{ textDecoration: "none" }}
                  component={Link}
                  to={"/datasource/" + query.datasource_id}
                >
                  {query.datasource_name}
                </Typography>
                <Typography variant="caption" align="center">
                  {query.error_count} error{query.error_count == 1 ? "" : "s"}
                </Typography>
                <div className="rightDivider" />
              </div>
            }
            action={
              <div>
                {query.query_hint && (
                  <IconButton onClick={this.toggleHint}>
                    <HelpIcon />
                  </IconButton>
                )}
                <IconButton onClick={this.openMenu}>
                  <MoreVertIcon />
                </IconButton>
              </div>
            }
            title={
              <Typography variant="h6">
                {query.query_name}
                {query.query_status && query.query_status_id !== 1
                  ? ` [${query.query_status}]`
                  : null}
              </Typography>
            }
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
          query_name={query.query_name}
          postpone={this.postpone}
        />
        <Typography variant="h5" className="headline">
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
        <Dialog open={isHintOpen} onClose={this.toggleHint} scroll="body">
          <DialogTitle id="scroll-dialog-title">How to fix</DialogTitle>

          <DialogContent>
            <DialogContentText>{query.query_hint}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.toggleHint} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  toggleHint = () => {
    this.setState(prevState => {
      return {
        isHintOpen: !prevState.isHintOpen
      }
    })
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
  postpone = query_error_ids => {
    this.setState({ isLoading: true })
    ajax({
      sp: "add_exception",
      query_error_ids: query_error_ids.join(","),
      remote_user: true,
      comment: ""
    }).then(data => {
      if (data[0].add_exception === "Exception limit reached") {
        dispathSnackbarMessage("Exception limit reached")
        this.setState({ isLoading: false })
        return
      }
      dispathSnackbarMessage("Errors postponed")

      this.getData()
    })
  }
}
