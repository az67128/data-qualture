import React from "react"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import TextField from "@material-ui/core/TextField"
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import FormHelperText from "@material-ui/core/FormHelperText"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import Fab from "../component/Fab"
import SaveIcon from "@material-ui/icons/Save"
import Spacer from "../component/Spacer"
import { ajax, dispathSnackbarMessage } from "../helper/common"
import { requiredQueryFieds } from "../constant/common"
import ScheduleControl from "../component/ScheduleControl"
import LinearProgress from "@material-ui/core/LinearProgress"
import IconButton from "@material-ui/core/IconButton"
import BackIcon from "@material-ui/icons/ArrowBack"
import { Link } from "react-router-dom"
import Autocomplete from "../component/Autocomplete"
export default class EditQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      query: {
        query_id: 0,
        query_name: "",
        query_description: "",
        query_justification: "",
        query_hint: "",
        email_template: "",
        error_report_script: "",
        error_person_association_script: "",
        target_id: "",
        datasource_id: "",
        query_status_id: 1,
        mn: "",
        tu: "",
        wd: "",
        th: "",
        fr: "",
        sa: "",
        sn: "",
        schedule_time: "05:00",
        responsible: [],
        accountable: [],
        informed: []
      },
      isFormChecked: false,
      isModified: false,
      target: [],
      datasource: [],
      person: [],
      query_status: [],
      isLoading: false
    }
  }
  componentDidMount() {
    window.scrollTo(0, 0)
    this.getDictionary()
  }
  render() {
    const {
      query,
      isModified,
      target,
      datasource,
      query_status,
      isFormChecked,
      isLoading,
      person
    } = this.state
    return (
      <div>
        {isLoading && <LinearProgress className="fixedProgress" />}
        <Typography variant="headline" className="headline">
          <IconButton
            component={Link}
            to={query.query_id ? "/query/" + query.query_id : "/querylist"}
          >
            <BackIcon />
          </IconButton>General info
        </Typography>
        <Paper className="paper">
          <TextField
            fullWidth
            required
            error={isFormChecked && !query.query_name}
            label="Query name"
            value={query.query_name || ""}
            onChange={this.handleQueryChange("query_name")}
          />
          <TextField
            fullWidth
            required
            error={isFormChecked && !query.query_description}
            multiline={true}
            rowsMax={10}
            label="Description"
            value={query.query_description || ""}
            onChange={this.handleQueryChange("query_description")}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline={true}
            rowsMax={10}
            label="Justification"
            value={query.query_justification || ""}
            onChange={this.handleQueryChange("query_justification")}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline={true}
            rowsMax={10}
            label="Hint"
            value={query.query_hint || ""}
            onChange={this.handleQueryChange("query_hint")}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email template"
            value={query.email_template || ""}
            onChange={this.handleQueryChange("email_template")}
          />
          <FormHelperText>
            {"Use mask ${column_name} for values"}
          </FormHelperText>
        </Paper>

        <Typography variant="headline" className="headline">
          Settings
        </Typography>
        <Paper className="paper">
          <FormControl
            required
            fullWidth
            error={isFormChecked && !query.target_id}
          >
            <InputLabel htmlFor="target">Target</InputLabel>
            <Select
              value={query.target_id || ""}
              onChange={this.handleQueryChange("target_id")}
              name="target"
              inputProps={{
                id: "target"
              }}
            >
              {target.map(item => {
                return (
                  <MenuItem value={item.target_id || ""} key={item.target_id}>
                    {item.target_name}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
          <FormControl
            required
            fullWidth
            margin="normal"
            error={isFormChecked && !query.datasource_id}
          >
            <InputLabel htmlFor="datasource">Datasource</InputLabel>
            <Select
              value={query.datasource_id || ""}
              onChange={this.handleQueryChange("datasource_id")}
              name="datasource"
              inputProps={{
                id: "datasource"
              }}
            >
              {datasource.map(item => {
                return (
                  <MenuItem
                    value={item.datasource_id || ""}
                    key={item.datasource_id}
                  >
                    {item.datasource_name}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>

          <FormControl
            required
            fullWidth
            margin="normal"
            error={isFormChecked && !query.query_status_id}
          >
            <InputLabel htmlFor="datasource">Status</InputLabel>
            <Select
              value={query.query_status_id || ""}
              onChange={this.handleQueryChange("query_status_id")}
              name="status"
              inputProps={{
                id: "status"
              }}
            >
              {query_status.map(item => {
                return (
                  <MenuItem
                    value={item.query_status_id}
                    key={item.query_status_id}
                  >
                    {item.query_status}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            required
            margin="normal"
            error={isFormChecked && !query.error_report_script}
            multiline={true}
            rowsMax={10}
            label="Error report script"
            value={query.error_report_script || ""}
            onChange={this.handleQueryChange("error_report_script")}
          />

          <FormHelperText>
            Add error_id field for error identificator
          </FormHelperText>
          <TextField
            fullWidth
            margin="normal"
            multiline={true}
            rowsMax={10}
            label="Error person association script"
            value={query.error_person_association_script || ""}
            onChange={this.handleQueryChange("error_person_association_script")}
          />
          <FormHelperText>
            Columns [person_id or person_login or person_email], [type(id,
            login, email)], [error_id] to associate person with error
          </FormHelperText>
        </Paper>
        <Typography variant="headline" className="headline">
          People
        </Typography>
        <Paper className="paper">
          <Autocomplete
            label="Responsible"
            suggestions={person}
            value={query.responsible}
            onChange={this.handleQueryChange("responsible")}
          />
          <Autocomplete
            label="Accountable"
            margin="normal"
            suggestions={person}
            value={query.accountable}
            onChange={this.handleQueryChange("accountable")}
          />
          <Autocomplete
            label="Informed"
            margin="normal"
            suggestions={person}
            value={query.informed}
            onChange={this.handleQueryChange("informed")}
          />
        </Paper>
        <Typography variant="headline" className="headline">
          Schedule
        </Typography>
        <Paper className="paper">
          <ScheduleControl query={query} onChange={this.handleQueryChange} />
        </Paper>
        <Spacer />
        <Spacer />
        {isModified && (
          <Fab onClick={this.saveQuery}>
            <SaveIcon />
          </Fab>
        )}
      </div>
    )
  }
  formatPeople = people => {
    if (!people) return null

    const formattedPeople = people.map(person => {
      return person.value
    })
    return formattedPeople.join(",")
  }
  saveQuery = () => {
    const { query } = this.state
    const isFormValid = requiredQueryFieds.reduce((result, item) => {
      return !!query[item] && result
    }, true)
    this.setState({
      isFormChecked: true
    })
    if (isFormValid) {
      this.setState({ isLoading: true, isModified: false })

      ajax({
        sp: "update_query",
        remote_user: true,
        ...query,
        responsible: this.formatPeople(query.responsible),
        accountable: this.formatPeople(query.accountable),
        informed: this.formatPeople(query.informed)
      })
        .then(result => {
          //console.log(result)
        })
        .catch(err => {
          this.setState({ isModified: true })

          dispathSnackbarMessage("Not authoized")
          this.setState({ isLoading: false })
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
    }
  }
  getDictionary = () => {
    this.setState({ isLoading: true })
    Promise.all([
      ajax({ sp: "get_target_list" }).then(data => {
        return { name: "target", data: data }
      }),
      ajax({ sp: "get_datasource_list" }).then(data => {
        return { name: "datasource", data: data }
      }),
      ajax({ sp: "get_query_status_list" }).then(data => {
        return { name: "query_status", data: data }
      }),
      ajax({ sp: "get_person_list" }).then(data => {
        return {
          name: "person",
          data: data.map(item => {
            return { value: item.user_id, label: item.person_name }
          })
        }
      }),
      this.getQuery()
    ]).then(dictionary => {
      dictionary.forEach(item => {
        const dict = {}
        if (item) {
          dict[item.name] = item.data
        }
        this.setState({
          ...dict,
          isLoading: false
        })
      })
    })
  }
  getQuery = () => {
    return !this.props.match.params.q_id
      ? null
      : ajax({
          sp: "get_query_raw",
          query_id: this.props.match.params.q_id
        }).then(data => {
          return {
            name: "query",
            data: {
              ...data[0],
              responsible: JSON.parse(data[0].responsible),
              accountable: JSON.parse(data[0].accountable),
              informed: JSON.parse(data[0].informed)
            }
          }
        })
  }
  handleQueryChange = property => event => {
    const value = event.target.checked
      ? event.target.checked
      : event.target.value
    this.setState(prevState => {
      return {
        isModified: true,
        query: { ...prevState.query, [property]: value }
      }
    })
  }
}
