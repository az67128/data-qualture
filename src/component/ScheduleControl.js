import React from "react"
import FormGroup from "@material-ui/core/FormGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Checkbox from "@material-ui/core/Checkbox"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import TextField from "@material-ui/core/TextField"

export default function ScheduleControl(props) {
  const { query, onChange } = props
  return (
    <div>
      <Typography variant="caption">Run query every</Typography>

      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={query.mn} onChange={onChange("mn")} />}
          label="Mn"
        />
        <FormControlLabel
          control={<Checkbox checked={query.tu} onChange={onChange("tu")} />}
          label="Tu"
        />
        <FormControlLabel
          control={<Checkbox checked={query.wd} onChange={onChange("wd")} />}
          label="Wd"
        />
        <FormControlLabel
          control={<Checkbox checked={query.th} onChange={onChange("th")} />}
          label="Th"
        />
        <FormControlLabel
          control={<Checkbox checked={query.fr} onChange={onChange("fr")} />}
          label="Fr"
        />
        <FormControlLabel
          control={<Checkbox checked={query.sa} onChange={onChange("sa")} />}
          label="Sa"
        />
        <FormControlLabel
          control={<Checkbox checked={query.sn} onChange={onChange("sn")} />}
          label="Sn"
        />
        <Button color="primary" size="small" onClick={selectAll}>
          Select All
        </Button>
      </FormGroup>
      <TextField
        id="time"
        label="At"
        type="time"
        value={query.schedule_time || "05:00"}
        onChange={onChange("schedule_time")}
        InputLabelProps={{
          shrink: true
        }}
        inputProps={{
          step: 300 // 5 min
        }}
      />
    </div>
  )
  function selectAll() {
    const value = { target: { value: true } }
    onChange("mn")(value)
    onChange("tu")(value)
    onChange("wd")(value)
    onChange("th")(value)
    onChange("fr")(value)
    onChange("sa")(value)
    onChange("sn")(value)
  }
}
