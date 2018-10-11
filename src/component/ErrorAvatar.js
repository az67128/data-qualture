import React from "react";
import Typography from "@material-ui/core/Typography";
import "../css/erroravatar.css";
export default function ErrorAvatar(props) {
  const { error_count, error_delta } = props;
  return (
    <div className="errorAvatar">
      <div className="rightBorder" />
      <div>
        <Typography variant="body2" align="center">
          {error_count} error{error_count == 1 ? "" : "s"}
        </Typography>
      </div>
      <div>
        {parseFloat(error_delta) !== 0 && (
          <Typography
            variant="body1"
            align="center"
            className={
              "errorBadge " + (error_delta > 0 ? "negative" : "positive")
            }
          >
            {error_delta > 0 ? "+" : ""}

            {error_delta == 0 ? null : error_delta}
          </Typography>
        )}
      </div>
    </div>
  );
}
