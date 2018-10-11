import React from "react";
import Grid from "@material-ui/core/Grid";
import StatItem from "../component/StatItem";

export default class StatGrid extends React.Component {
  state = {
    xs: 12
  };
  render() {
    const { xs } = this.state;
    const {
      data,
      idPropName,
      nameProp,
      chartDataSp,
      withAvatar,
      pictureProp
    } = this.props;
    console.log(data);
    return (
      <div className={xs < 12 ? "padding1rem" : ""}>
        <Grid container spacing={24}>
          {data.map(item => {
            return (
              <Grid
                item
                xs={xs || 6}
                className="padding1rem"
                key={item[idPropName]}
              >
                <StatItem
                  name={item[nameProp]}
                  withAvatar={withAvatar}
                  query_count={item.query_count}
                  error_count={item.error_count}
                  error_delta={item.error_delta}
                  chartDataSp={chartDataSp}
                  idPropName={idPropName}
                  item_id={item[idPropName]}
                  picture_link={withAvatar && item[pictureProp]}
                />
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  }
  componentDidMount() {
    window.scrollTo(0, 0);
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
  updateDimensions = () => {
    const width = window.innerWidth;
    let xs = 6;
    if (width <= 550) {
      xs = 12;
    } else if (width <= 1100) {
      xs = 6;
    } else if (width <= 1650) {
      xs = 4;
    } else {
      xs = 3;
    }
    this.setState({ xs: xs });
  };
}
