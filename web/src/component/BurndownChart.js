import React from "react";
import { Line } from "react-chartjs-2";
import "../css/chart.css";

export default class ErrorChart extends React.Component {
  render() {
    const labels = this.props.data.map(item => {
      return item.report_date.slice(5, 10);
    });
    const datasets = [
      {
        label: "Queries",
        yAxisID: "B",
        data: this.props.data.map(item => {
          return item.query_count;
        }),
        pointRadius: 0,
        lineTension: 0.1,
        backgroundColor: "transparent",
        borderColor: "#2E7D32"
      },
      {
        label: "Old Error",
        data: this.props.data.map(item => {
          return item.old_err;
        }),
        yAxisID: "A",
        pointRadius: 0,
        lineTension: 0.1,
        backgroundColor: "#e65100",
        borderColor: "#e65100"
      },
      {
        label: "New Rule Error",
        data: this.props.data.map(item => {
          return item.new_rule_err * -1;
        }),
        yAxisID: "A",
        pointRadius: 0,
        lineTension: 0.1,
        backgroundColor: "#FDD835",
        borderColor: "#FDD835"
      },
      {
        label: "New Error",
        yAxisID: "A",
        data: this.props.data.map(item => {
          return item.new_err * -1;
        }),
        pointRadius: 0,
        lineTension: 0.1,
        backgroundColor: "#ff9800",
        borderColor: "#ff9800"
      }
    ];
    const chartData = {
      labels: labels,
      datasets: datasets
    };
    const chartOptions = {
      responsive: true,
      scales: {
        yAxes: [
          {
            id: "B",

            position: "right"
          },
          {
            id: "A",

            position: "left",
            stacked: true
          }
        ]
      },
      legend: {
        position: "bottom"
      },
      devicePixelRatio: 2
    };
    return (
      <div className={"chart"}>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  }
}
