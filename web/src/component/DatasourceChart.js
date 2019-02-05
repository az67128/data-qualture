import React from "react";
import { Line } from "react-chartjs-2";
import { colorStack } from "../constant/chart";
import "../css/chart.css";

export default class ErrorChart extends React.Component {
  render() {
    const labels = this.props.data
      .map(item => {
        return item.report_date.slice(5, 10);
      })
      .filter((item, i, self) => {
        return self.indexOf(item) === i;
      });

    const datasources = {};

    this.props.data.forEach(item => {
      if (!datasources[item.datasource_name]) {
        datasources[item.datasource_name] = [];
      }
      datasources[item.datasource_name].push(item.err);
    });

    const datasets = Object.keys(datasources).map((item, i) => {
      return {
        label: item,
        data: datasources[item],
        pointRadius: 0,
        lineTension: 0.1,
        backgroundColor: colorStack[i],
        borderColor: colorStack[i]
      };
    });
    const chartData = {
      labels: labels,
      datasets: datasets
    };
    const chartOptions = {
      scales: {
        yAxes: [
          {
            stacked: true
          }
        ]
      },
      responsive: true,
      legend: {
        position: "bottom",
        display: window.innerWidth > 450
      },
      maintainAspectRatio: true
    };

    return (
      <div className="chart">
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  }
}
