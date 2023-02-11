import React from 'react';
import {
  AppBar, Toolbar, Typography, Button
} from '@material-ui/core';
import './TopBar.css';
import axios from 'axios'

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      version: "",
      greeting: ""


    }
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.addPhoto = this.addPhoto.bind(this);

  }


  componentDidMount() {
    if (this.props.currUserId) {
      axios.get("/user/" + this.props.currUserId).then((res) => {
        this.setState({ greeting: "Hi " + res.data.first_name });
      })
    }
  }

  componentDidUpdate() {
    if (this.props.currUserId) {
      axios.get("/user/" + this.props.currUserId).then((res) => {
        this.setState({ greeting: "Hi " + res.data.first_name + "!"});
      })
    }
  }

  addPhoto(e) {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
     // Create a DOM form and add the file to it under the name uploadedphoto
     const domForm = new FormData();
     domForm.append('uploadedphoto', this.uploadInput.files[0]);
     axios.post('/photos/new', domForm)
       .then((res) => {
         console.log(res);
       })
       .catch(err => console.log(`POST ERR: ${err}`));
 }  }

  handleButtonClick() {
    axios.post("/admin/logout").then((res) => {
      console.log(res);
      this.props.onNewLog(false, null, 12);
    }).catch((rej) => console.log(rej));
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="static">
        <Toolbar>
        <Typography className="myName" edge="start" variant="h5" color="inherit"> Amrita Venkatraman </Typography>

          {this.props.isIn ?
            <Typography className="myName" edge="start" variant="h5" color="inherit">
              {this.state.greeting}
            </Typography> : <Typography className="myName" edge="start" variant="h5" color="inherit">
            </Typography>}

          {this.props.isIn ?
            <div><Button className="addPhoto" onClick={e => this.addPhoto(e)}>
              Add Photo  </Button> <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
           </div>
            : <Typography variant="h5" color="inherit">

            </Typography>
          }
          {this.props.isIn ?
            <Typography className="log" variant="h5" color="inherit" onClick={e => this.handleButtonClick(e)}>
              LOGOUT
          </Typography> : <Typography className="log" variant="h5" color="inherit" onClick={e => this.handleButtonClick(e)}>
              LOGIN
          </Typography>}

        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
