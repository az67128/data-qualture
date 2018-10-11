import React from "react";
import { Line } from "react-chartjs-2";
import "../css/chart.css";

export default class ErrorChart extends React.Component {
  render() {
    const legeng = this.props.legend
      ? {
          position: "bottom"
        }
      : null;
    const labels = this.props.data.map(item => {
      return item.report_date.slice(5, 10);
    });
    const { className } = this.props;
    const datasets = [
      {
        label: "Old Error",
        data: this.props.data.map(item => {
          return item.old_err;
        }),
        pointRadius: 0,
        lineTension: 0.1,
        backgroundColor: "#e65100",
        borderColor: "#e65100"
      },
      {
        label: "Error",
        data: this.props.data.map(item => {
          return item.err;
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
      legend: legeng,
      devicePixelRatio: 2
    };
    return (
      <div className={"chart " + className}>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  }
}
