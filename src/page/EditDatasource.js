import React from "react"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import { ajax, dispathSnackbarMessage } from "../helper/common"
export default class EditDatasource extends React.Component {
  state = {
    isModified: false,
    datasource: {
      datasource_id: 0,
      datasource_name: "",
      datasource_description: ""
    },
    isLoading: true,
    isFormChecke: false
  }
  componentDidMount() {
    if (this.props.editItem.datasource_id) {
      this.setState({ datasource: this.props.editItem })
    }
  }
  render() {
    const { isOpen, handleClose } = this.props
    const { datasource, isModified, isLoading, isFormChecked } = this.state

    return (
      <div>
        <Dialog open={isOpen} onClose={handleClose}>
          <DialogTitle>Edit datasource</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="datasource_name"
              label="Datasource name"
              required
              value={datasource.datasource_name}
              onChange={this.handleChange("datasource_name")}
              error={isFormChecked && !datasource.datasource_name}
              fullWidth
            />
            <TextField
              margin="dense"
              id="datasource_description"
              label="Description"
              value={datasource.datasource_description}
              onChange={this.handleChange("datasource_description")}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            {isModified && (
              <Button onClick={this.saveDatasource} color="primary">
                Save
              </Button>
            )}
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
  saveDatasource = () => {
    const { datasource } = this.state
    if (!datasource.datasource_name) {
      this.setState({ isFormChecked: true })
      return
    }
    this.setState({ isoading: true })
    ajax({
      sp: "update_datasource",
      remote_user: true,
      ...this.state.datasource
    })
      .then(data => {
        this.setState({ isoading: false })
        this.props.handleClose(true)
      })
      .catch(err => {
        dispathSnackbarMessage("Not authoized")
        this.setState({ isLoading: false })
      })
  }

  handleChange = property => event => {
    const value = event.target.value
    this.setState(prevState => {
      return {
        isModified: true,
        datasource: { ...prevState.datasource, [property]: value }
      }
    })
  }
}
