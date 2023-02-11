import React from 'react';
import './userDetail.css';
import { Link } from "react-router-dom";
import {
  Button

} from '@material-ui/core';
import axios from 'axios'
/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: this.props.match.params.userId,
      user: {},
      loggedInUserId: this.props.currUserId,

    }

    this.deleteUser = this.deleteUser.bind(this);

  }

  deleteUser(id) {
    console.log("deleting user");
    axios.post("/delete/user/" + id).then((res) => {
      console.log(res);
      axios.post("/admin/logout").then((res) => {
        console.log(res);
        console.log("logging out");
        this.props.onNewLog(false, null, 12);
      }).catch((rej) => console.log(rej));
    }).catch((rej) => console.log(rej));
  }

  componentDidMount() {
    axios.get("/user/" + this.props.match.params.userId).then((res) => {
      this.setState({ userId: this.props.match.params.userId });
      this.setState({ user: res.data });

    }).catch((rej) => console.log(rej));
  }


  componentDidUpdate() {
    if (this.state.userId !== this.props.match.params.userId) {
      axios.get("/user/" + this.props.match.params.userId).then((res) => {
        this.setState({ userId: this.props.match.params.userId });
        this.setState({ user: res.data });

      }).catch((rej) => console.log(rej));
    }
  }

  componentWillUnmount() {
    this.props.onNewInfo("");
  }

  

  render() {
    return (
      <div className="card">
      <ul>
        <li> <strong> Name: </strong> {this.state.user.first_name + ' ' + this.state.user.last_name} </li>
        <li> <strong> Location: </strong> {this.state.user.location} </li>
        <li> <strong> Status: </strong> {this.state.user.description} </li>
        <li> <strong> Occupation: </strong> {this.state.user.occupation} </li>
        {this.state.user.photo1 !== undefined ? <li><strong> Photo with most comments: </strong>
          <Link to={"/photos/" + this.state.userId}>
           <img width="150" height="100" src={"images/" + this.state.user.photo1.file_name}/> </Link><div> Number of Comments: {this.state.user.photo1.comments.length}</div></li> 
        : <li></li>}
       {this.state.user.photo2 !== undefined ? <li> <strong> Most Recently Uploaded:  
       </strong> <Link to={"/photos/" + this.state.userId}><img width="150" height="100" src={"images/" + this.state.user.photo2.file_name} /> </Link><div> Taken: {this.state.user.photo2.date_time}</div></li>
       : <li></li>}
      
        </ul>
        <Link className="photoGo" to={"/photos/" + this.state.userId}> View My Photos </Link>
        {this.state.userId === this.state.loggedInUserId ?  <Button  onClick={() => this.deleteUser(this.state.userId)} className="photoGo"> Delete User </Button> : null}
      </div>

    );
  }
}

export default UserDetail;
