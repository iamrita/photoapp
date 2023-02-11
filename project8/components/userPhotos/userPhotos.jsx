import React from 'react';

import './userPhotos.css';
import {
  List,
  ListItem,
  Card,
  Button

} from '@material-ui/core';
import { Link } from "react-router-dom";
import axios from 'axios';


/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: this.props.match.params.userId,
      loggedInUserId: this.props.currUserId,
      user: {},
      photos: [],
      inputValues: [],
      likeButtonStates: [],
      intervalId: undefined,
      unliked: true,

    }

    this.handleChangeBound = event => this.handleChange(event);
    this.addComment = this.addComment.bind(this);
    this.addLike = this.addLike.bind(this);
    this.deletePhoto = this.deletePhoto.bind(this);
    this.deleteComment = this.deleteComment.bind(this);

  }


  componentDidMount() {
  
    axios.get("/photosOfUser/" + this.props.match.params.userId).then((res) => {
      this.setState({ userId: this.props.match.params.userId });
      this.setState({ photos: res.data });
      console.log(this.state.photos);
      let temp = [];
      let temp2 = []
      for (let i = 0; i < res.data.length; i++) {
        temp[i] = ""
        if (res.data[i].likes.length === 0) {
          temp2[i] = "Like"
        } else {
          temp2[i] = "Like"
          for (let j = 0; j < res.data[i].likes.length; j++) {
            if (res.data[i].likes[j].user_id === this.state.loggedInUserId) {
              temp2[i] = "Unlike";
            }
          }
        }
      }
      this.setState({inputValues: temp });
      this.setState({likeButtonStates: temp2});

   

    
    }).catch((rej) => console.log(rej));
 
  }


  componentDidUpdate() {
    if (this.state.userId !== this.props.match.params.userId) {

      axios.get("/photosOfUser/" + this.props.match.params.userId).then((res) => {
        this.setState({ userId: this.props.match.params.userId });
        this.setState({ photos: res.data });
        console.log('photos', this.state.photos);
        let temp2 =[]
        let temp =[]
        for (let i = 0; i < res.data.length; i++) {
          temp[i] = ""
          if (res.data[i].likes.length === 0) {
            temp2[i] = "Like"
          } else {
            for (let j = 0; j < res.data[i].likes.length; j++) {
              if (res.data[i].likes[j].user_id === this.state.loggedInUserId) {
                temp2[i] = "Unlike";
              }
            }
          }
        }
        this.setState({likeButtonStates: temp2});


   
      }).catch((rej) => console.log(rej));
    }
  }

  componentWillUnmount() {
  }

  addLike(id, index) {
    if (this.state.likeButtonStates[index] === 'Like') {
      axios.post('/likes/new/' + id).then((res) => {
        console.log(res);
        axios.get("/photosOfUser/" + this.props.match.params.userId).then((res) => {
          this.setState({ userId: this.props.match.params.userId });
          this.setState({ photos: res.data });
        }).catch((rej) => console.log(rej));
      }).catch((rej) => console.log(rej));
      let copy = this.state.likeButtonStates;
      copy[index] = "Unlike";
      this.setState({likeButtonStates: copy});
    } else {
      axios.post('/likes/delete/' + id).then((res) => {
        console.log(res);
        axios.get("/photosOfUser/" + this.props.match.params.userId).then((res) => {
          this.setState({ userId: this.props.match.params.userId });
          this.setState({ photos: res.data });
        }).catch((rej) => console.log(rej));
      }).catch((rej) => console.log(rej));
      let copy = this.state.likeButtonStates;
      copy[index] = "Like";
      this.setState({likeButtonStates: copy});
    }

  }

  deletePhoto(id) {
    console.log("delete photo");
    axios.post('/delete/photo/' + id).then((res) => {
      console.log(res);
      axios.get("/photosOfUser/" + this.props.match.params.userId).then((res) => {
        this.setState({ userId: this.props.match.params.userId });
        this.setState({ photos: res.data });
      }).catch((rej) => console.log(rej));
    }).catch((rej) => console.log(rej));
  }

  deleteComment(id, photoId) {
    console.log("delete comment");
    let photoObj = {};
    photoObj.id = photoId
    axios.post('/delete/comment/' + id, photoObj).then((res) => {
      console.log(res);
      axios.get("/photosOfUser/" + this.props.match.params.userId).then((res) => {
        this.setState({ userId: this.props.match.params.userId });
        this.setState({ photos: res.data });
      }).catch((rej) => console.log(rej));
    }).catch((rej) => console.log(rej));

  }

  addComment(id, index) {
    console.log("add comment");
    let comment = {}
    comment.comment = this.state.inputValues[index];
    axios.post('/commentsOfPhoto/' + id, comment).then((res) => {
      axios.get("/photosOfUser/" + this.props.match.params.userId).then((res) => {
        this.setState({ userId: this.props.match.params.userId });
        this.setState({ photos: res.data });
      }).catch((rej) => console.log(rej));
      console.log(res);
    }).catch((rej) => console.log(rej));
  }



  handleChange(index) {
    let inputValueCopy = this.state.inputValues;
    inputValueCopy[index] = event.target.value;
    this.setState({ inputValues: inputValueCopy });
  }


  render() {


    return (
      <div className="photoContainer">
      {this.state.photos !== undefined ?
        <List>
          {this.state.photos.map((i, index) =>
            <ListItem key={i.file_name}>
              <Card>
                <img src={"images/" + i.file_name} />
                <ul> Taken: {i.date_time} </ul>
                {this.state.loggedInUserId === i.user_id ? <Button onClick={() => this.deletePhoto(i._id)}> Delete My Photo </Button> : null}
                <Button onClick= {() => this.addLike(i._id, index)}> {this.state.likeButtonStates[index]} </Button>
                {i.likes.length !== 0 ? <ul> Like Count: {i.likes.length} </ul> : <ul> No Likes Yet </ul>}
                {i.comments !== undefined ?
                  <List>
                    {i.comments.map((c) =>
                      <ListItem key={c._id}>
                        <div className="username_photo"><ul> User: <Link to={'/users/' + c.user._id}> {c.user.first_name + " " + c.user.last_name}</Link> </ul></div>
                        <ul> Commented: {c.date_time} </ul>
                        <ul> Comment: {c.comment} </ul>
                        <ul> {JSON.stringify(this.state.loggedInUserId) === JSON.stringify(c.user._id) ? <Button onClick={() => this.deleteComment(c._id, i._id)}> Delete My Comment </Button> : null}</ul>

                      </ListItem>
                    )}
                  </List> : <div> No Comments To Show</div>}
                <ul> <button onClick={() => this.addComment(i._id, index)}> Add Commment </button>
                  <input type="text" value={this.state.inputValues[index]} onChange={() => this.handleChangeBound(index)} />

                </ul>

              </Card>
            </ListItem>
          )
          }
        </List> : null}
      </div>

    );
  }
}

export default UserPhotos;
