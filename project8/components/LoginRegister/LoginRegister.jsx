import React from 'react';

import './LoginRegister.css';
import axios from 'axios'



/**
 * Define LoginRegister, a React componment of CS142 project #5
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValueU: '',
      inputValueP: '',
      newUserForm: false,
      username: '',
      pw1: '',
      pw2: '',
      first_name: '',
      last_name: '',
      status: '',
      occupation: '',
      location: '',
      passwordMatch: true
    }
    this.handleChangeBound = event => this.handleChange(event);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleChangeP = this.handleChangeP.bind(this);
    this.handleNewUserForm = this.handleNewUserForm.bind(this);
    this.registerNewUser = this.registerNewUser.bind(this);
    this.newUser = this.newUser.bind(this);

  }


  handleChange(event) {
    this.setState({ inputValueU: event.target.value });
  }

  handleChangeP(event) {
    this.setState({ inputValueP: event.target.value });

  }

  handleButtonClick() {
    let userObj = {}
    userObj.login_name = this.state.inputValueU
    userObj.password = this.state.inputValueP
    userObj.newUser = false;
    axios.post("/admin/login", userObj).then((res) => {
      this.props.onNewLog(true, res.data._id, 9);
    }).catch((rej) => console.log(rej));
  }

  handleNewUserForm(event) {
    if (event.target.name === 'username') {
      this.setState({ username: event.target.value })
    }
    if (event.target.name === 'password1') {
      this.setState({ pw1: event.target.value })
    }
    if (event.target.name === 'password2') {
      this.setState({ pw2: event.target.value })
    }
    if (event.target.name === 'first_name') {
      this.setState({ first_name: event.target.value })
    }
    if (event.target.name === 'last_name') {
      this.setState({ last_name: event.target.value })
    }
    if (event.target.name === 'status') {
      this.setState({ status: event.target.value })
    }
    if (event.target.name === 'occupation') {
      this.setState({ occupation: event.target.value })
    }
    if (event.target.name === 'location') {
      this.setState({ location: event.target.value })
    }
  }

  newUser() {
    this.setState({ newUserForm: true })

  }

  registerNewUser() {
    let newUser = {}
    newUser.login_name = this.state.username;
    newUser.password = this.state.pw1;
    newUser.first_name = this.state.first_name;
    newUser.last_name = this.state.last_name;
    newUser.status = this.state.status;
    newUser.occupation = this.state.occupation;
    newUser.location = this.state.location;

    if (this.state.pw1 !== this.state.pw2) {
      console.log("Passwords do not match");
      this.setState({passwordMatch: false});
    } else {
      axios.post('/user', newUser).then((res) => {
        console.log(res);
        let userObj = {login_name: this.state.username, password: this.state.pw1, newUser: true};
        axios.post("/admin/login", userObj).then((res) => {
          this.props.onNewLog(true, res.data._id, 9);
        }).catch((rej) => console.log(rej));
      }).catch((rej) => {
        console.log(rej);
      })
    }
  }

  render() {
    return (
      <div className="card-signin">
        <ul className="log-in">
          <li> Welcome</li>
          <li> <input className="inputButton" type="text" placeholder="Username" value={this.state.inputValueU} onChange={this.handleChangeBound} /> </li>


          <li> <input className="inputButton" type="password" placeholder="Password" value={this.state.inputValueP} onChange={this.handleChangeP} /> </li>

          <li> <button className="inputButton2" type="button" onClick={e => this.handleButtonClick(e)}> LOG IN </button></li>
          <li> <button className="inputButton2-signup" type="button" onClick={e => this.newUser(e)}> SIGN UP </button></li>
        </ul>

        {this.state.newUserForm ?
          <div>
            <div className="card-signin-2">
              <ul className="log-in">
                <li> <input className="inputButton" name="first_name" placeholder="First Name" type="text" onChange={this.handleNewUserForm} /> </li>
                <li><input name="username" placeholder="Username" className="inputButton" type="text" onChange={this.handleNewUserForm} />
                </li>
                <li>
                  <input type="password" name="password2" placeholder="Retype password" className="inputButton" onChange={this.handleNewUserForm} /> </li>
                  {this.state.passwordMatch ? null: <li className="passwordMatching">*Passwords do not match*</li>}
                <li>
                  <input type="text" name="occupation" className="inputButton" placeholder="Occupation" onChange={this.handleNewUserForm} /> </li>

              </ul>

              <ul className="log-in">
                <li>  <input className="inputButton" type="text" name="last_name" placeholder="Last Name" onChange={this.handleNewUserForm} /> </li>
                <li>
                  <input type="password" name="password1" className="inputButton" placeholder="Password" onChange={this.handleNewUserForm} /> </li>
                <li>
                  <input type="text" className="inputButton" name="location" placeholder="Location" onChange={this.handleNewUserForm} /> </li>
                <li>
                  <input type="text" className="inputButton" name="status" placeholder="Status" onChange={this.handleNewUserForm} /> </li>
              </ul>


            </div>
            <button className="inputButton2-register" type="button" onClick={e => this.registerNewUser(e)}> REGISTER </button>

          </div>

          : null}

      </div>
    );
  }
}

export default LoginRegister;
