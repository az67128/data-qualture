import React from "react"
import Button from "@material-ui/core/Button"
import { Link } from "react-router-dom"
export default function Fab(props) {
  return (
    <div className="fab">
      {props.linkTo ? (
        <Button
          variant="fab"
          color="secondary"
          component={Link}
          to={props.linkTo}
          onClick={props.onClick}
        >
          {props.children}
        </Button>
      ) : (
        <Button variant="fab" color="secondary" onClick={props.onClick}>
          {props.children}
        </Button>
      )}
    </div>
  )
}
