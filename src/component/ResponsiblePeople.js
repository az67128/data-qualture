import React from "react"
import Typography from "@material-ui/core/Typography"
import Chip from "@material-ui/core/Chip"
import Paper from "@material-ui/core/Paper"
import { Link } from "react-router-dom"
export default class ResonsiblePeople extends React.Component {
  render() {
    const { responsible, accountable, informed } = this.props
    if (!responsible && !accountable && !informed) return null
    return (
      <Paper className="paper">
        {responsible && (
          <div>
            <Typography variant="caption">Responsible</Typography>
            {responsible.map(person => {
              return (
                <Chip
                  key={person.person_id}
                  component={Link}
                  to={"/person/" + person.person_id}
                  className="userChip"
                  label={person.person_name}
                />
              )
            })}
          </div>
        )}
        {accountable && (
          <div>
            <Typography variant="caption">Accountable</Typography>
            {accountable.map(person => {
              return <Chip label={person.person_name} />
            })}
          </div>
        )}
        {informed && (
          <div>
            <Typography variant="caption">Informed</Typography>
            {informed.map(person => {
              return <Chip label={person.person_name} />
            })}
          </div>
        )}
      </Paper>
    )
  }
}
