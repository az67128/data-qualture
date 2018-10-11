import React from "react"
import Avatar from "@material-ui/core/Avatar"
import { Link } from "react-router-dom"
import { PRIMARY_COLOR } from "../constant/common"
export default function PersonAvatar(props) {
  const { user, color } = props
  const picture =
    user.picture_link && user.picture_link !== "null" ? user.picture_link : null
  const style =
    color === "primary" ? { border: "none", background: PRIMARY_COLOR } : null
  return (
    <div className="linkAvatar">
      <Avatar
        style={style}
        className={picture ? null : "textAvatar"}
        src={picture ? picture : null}
        component={Link}
        to={user.person_id ? "/mydq/" + user.person_id : "/profile"}
      >
        {!picture ? prepareAvatar(user.person_name) : null}
      </Avatar>
    </div>
  )
}
function prepareAvatar(userName) {
  if (userName.indexOf(" ") > 0) {
    const userNameSplit = userName.split(" ")
    return userNameSplit[0].slice(0, 1) + userNameSplit[1].slice(0, 1)
  } else {
    return userName.slice(0, 1)
  }
}
