import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
}
  from '@material-ui/core';
import './userList.css';
import axios from 'axios'


import { Link } from "react-router-dom";
/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: []
    }
    
  }

  componentDidMount() {
    axios.get("/user/list").then((res) => {
      this.setState({users: res.data});
    }).catch((rej) => console.log(rej));
  }

  componentDidUpdate() {
    axios.get("/user/list").then((res) => {
      this.setState({users: res.data});
    }).catch((rej) => console.log(rej));
  }
  componentWillUnmount() {
  }

  render() {
    return (
      <div>
        {
          <List component="nav">
            {this.state.users.map((i, index) =>
            <div key={index}>
              <ListItem>
                <Link className="names" to={'/users/' + i._id}> <ListItemText primary={i.first_name + ' ' + i.last_name} /></Link>
              </ListItem>
             {i.latest_activity !== undefined ? 
             <ListItem> <strong>Latest Activity: {i.latest_activity.action} </strong> </ListItem> 
             : <ListItem> <strong>Latest Activity: </strong> </ListItem> }
             {i.latest_activity !== undefined && i.latest_activity.thumbnail !== "" ? <img width="50" height="50" src={"images/" + i.latest_activity.thumbnail} /> : null}
              </div>
            )
            }
          </List>}
      </div>
    );
  }
}

export default UserList;
