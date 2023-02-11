import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import './styles/main.css';

import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/LoginRegister/LoginRegister';


class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      current: '',
      isLoggedIn: false,
      addedPhoto: false,
      userId: '',
      size: 12,
    }

    this.setInfo = this.setInfo.bind(this);
    this.setLoggedIn = this.setLoggedIn.bind(this);

  }

  setInfo = (newInfo) => {
    this.setState({ current: newInfo });
  }

  setAddedPhoto = (flag) => {
    this.setState({addedPhoto: flag});
  }

  setLoggedIn = (loggedIn, newId, newSize) => {
    this.setState({ isLoggedIn: loggedIn, userId: newId, size: newSize});
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar currentState={this.state.current} currUserId={this.state.userId} isIn={this.state.isLoggedIn} onNewLog={this.setLoggedIn}/>
            </Grid>
            <div className="cs142-main-topbar-buffer" />
           {this.state.isLoggedIn ? <Grid item sm={3}>
              <Paper className="cs142-side-grid-item">
                 <UserList /> 
              </Paper>
            </Grid> : null}
            <Grid item sm={this.state.size}>
              <Paper className="cs142-main-grid-item">
                <Switch>
                  {!this.state.isLoggedIn ?
                    <Route path="/login-register"
                      render={props => <LoginRegister {...props} onNewLog={this.setLoggedIn} />}
                    />
                    :
                    <Redirect path="/login-register" to={"/users/" + this.state.userId}
                    />
                  }
                  {this.state.isLoggedIn ?
                    <Route path={"/users/:userId"}
                      render={props => <UserDetail {...props} currUserId={this.state.userId} onNewInfo={this.setInfo} onNewLog={this.setLoggedIn}/>} />
                    :
                    <Redirect path={"/users/:userId"} to="/login-register" />}
                {this.state.isLoggedIn ?
                  <Route path="/photos/:userId"
                    render={props => <UserPhotos {...props} currUserId={this.state.userId} onNewInfo={this.setInfo} />}
                  /> :
                  <Redirect path={"/photos/:userId"} to="/login-register"/>}
                  <Route path="/users"
                    render={props => <UserList {...props} onNewInfo={this.setInfo} />}
                  />
                  <Redirect path="/" to="/login-register"
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
