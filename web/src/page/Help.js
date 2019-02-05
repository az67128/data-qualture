import React from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import AutoIcon from "@material-ui/icons/History";
import SocialIcon from "@material-ui/icons/Group";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import "../css/help.css";
export default class Help extends React.Component {
  render() {
    return (
      <div className="help">
        <Typography variant="h5" className="headline">
          What is Data Quality?
        </Typography>
        <Paper className="paper">
          <Typography>
            Data errors under control. Make your life easier.
          </Typography>
          <Typography>
            <IconButton color="primary">
              <AutoIcon />
            </IconButton>
            Automatic data quality checks.
          </Typography>
          <Typography>
            <IconButton color="primary">
              <SocialIcon />
            </IconButton>
            Social. Every error assigned to a person.
          </Typography>
          <Typography>
            <IconButton color="primary">
              <TrendingDownIcon />
            </IconButton>
            Analyze team, system and company performance.
          </Typography>
          <Typography>
            <IconButton color="primary">
              <TouchAppIcon />
            </IconButton>
            Easy to use.
          </Typography>
        </Paper>
        <Typography variant="h5" className="headline">
          Whants to buy?
        </Typography>
        <Paper className="paper">
          Contact us
          <a href="mailto:Alexander.Zinchenko.A@gmail.com">
            Alexander.Zinchenko.A@gmail.com
          </a>
        </Paper>
      </div>
    );
  }
}
