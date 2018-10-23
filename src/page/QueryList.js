import React from "react";
import Fab from "../component/Fab";
import AddIcon from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import { ajax } from "../helper/common";
import QueryTable from "../component/QueryTable";
import LinearProgress from "@material-ui/core/LinearProgress";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";

export default class QueryList extends React.Component {
  state = {
    query: [],
    isLoading: false,
    isSearchActive: false,
    searchString: "",
    stat: { person_name: "" }
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    this.getQueryList();
  }

  render() {
    const { isLoading, query, isSearchActive, searchString, stat } = this.state;
    const queryList = this.searchInArray(query, searchString);
    let title = "Data Quality ";
    if (this.props.match.path === "/datasource/:datasource_id" && query[0]) {
      title += " in " + query[0].datasource_name;
    }
    if (this.props.match.path === "/person/:person_id") {
      title += stat.person_name ? " for " + stat.person_name : "";
    }
    return (
      <div className="queryList">
        {isLoading && <LinearProgress className="fixedProgress" />}
        <IconButton
          className="searchButton"
          color={isSearchActive ? "primary" : "default"}
          onClick={this.toggleSearch}
        >
          <SearchIcon />
        </IconButton>
        <div className="listHeader">
          {!isSearchActive && (
            <Typography variant="headline" className="headline">
              {title}
            </Typography>
          )}
          {isSearchActive && (
            <div className="searchField">
              <TextField
                fullWidth
                value={searchString}
                autoFocus={true}
                placeholder="Search"
                onChange={this.searchChange}
              />
            </div>
          )}
        </div>

        <div className="clear" />
        <QueryTable data={queryList} />

        <Fab linkTo="/editquery">
          <AddIcon />
        </Fab>
      </div>
    );
  }
  searchInArray = (searchArray, searchString) => {
    if (!searchString) return searchArray;
    const regExp = new RegExp(
      "(?=.*" + searchString.split(" ").join(")(?=.*") + ")",
      "i"
    );
    return searchArray.filter(row => {
      return Object.keys(row).reduce((desicion, item) => {
        return desicion || regExp.test(row[item]);
      }, false);
    });
  };
  searchChange = e => {
    this.setState({ searchString: e.target.value });
  };
  toggleSearch = () => {
    this.setState(prevState => {
      return { isSearchActive: !prevState.isSearchActive, searchString: "" };
    });
  };
  getQueryList = () => {
    this.setState({ isLoading: true, isSearchActive: false, searchString: "" });
    if (
      this.props.match.path === "/querylist" ||
      this.props.match.path === "/datasource/:datasource_id"
    ) {
      this.getDatasourceQueries();
    }
    if (this.props.match.path === "/person/:person_id") {
      this.getPersonQueries();
    }
  };
  getPersonQueries = () => {
    Promise.all([
      ajax({
        sp: "get_query_list_by_person",
        person_id: this.props.match.params.person_id
      }).then(data => {
        this.setState({
          query: data
        });
      }),
      ajax({
        sp: "get_person_list_with_stat",
        person_id: this.props.match.params.person_id
      }).then(data => {
        this.setState({
          stat: data[0]
        });
      })
    ]).then(() => {
      this.setState({ isLoading: false });
    });
  };

  getDatasourceQueries = () => {
    const datasource_id = this.props.match.params.datasource_id
      ? this.props.match.params.datasource_id
      : null;
    ajax({ sp: "get_query_list", datasource_id: datasource_id }).then(data => {
      this.setState({
        query: data,
        isLoading: false
      });
    });
  };
  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.datasource_id !==
        prevProps.match.params.datasource_id ||
      this.props.match.params.person_id !== prevProps.match.params.person_id
    ) {
      this.getQueryList();
    }
  }
}
