import React from "react";

export default function ErrorBadge(props) {
  const { count } = props;
  if (count == 0) return null;
  const isPositive = count > 0 ? "positive" : "negative";
  const errorCount = count > 0 ? "+" + count : count;
  return <div className={"errorBadge " + isPositive}>{errorCount}</div>;
}
