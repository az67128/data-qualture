import Table2Excel from "table2excel.js";
export function saveToExcel(error_report, query_name) {
  console.log(error_report);
  const headers = Object.keys(JSON.parse(error_report[0].error_report)).map(
    item => {
      return item;
    }
  );
  let tableHtml = `<table><thead><tr>
  ${headers
    .map(item => {
      if (item === "error_id") return "";
      return "<th>" + item + "</th>";
    })
    .join("")}
  </tr></thead><tbody>
  ${error_report
    .map(row => {
      const rowParsed = JSON.parse(row.error_report);
      return (
        "<tr>" +
        headers
          .map(cellName => {
            if (cellName === "error_id") return "";
            return "<td>" + rowParsed[cellName] + "</td>";
          })
          .join("") +
        "</tr>"
      );
    })
    .join("")}
  </tbody></table>`;
  console.log(tableHtml);
  const table = document.createElement("table");
  table.id = "exportTable";
  table.innerHTML = tableHtml;
  document.body.appendChild(table);
  new Table2Excel("#exportTable").export(
    "DQ_" + new Date().toISOString().slice(0, 10) + "_" + query_name
  );
  document.body.removeChild(table);
}
