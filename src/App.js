import React, { Component } from 'react';
import './App.css';
import LoginView from './LoginView';
import LoggedView from './LoggedView';
import Cookies from 'js-cookie'

class App extends Component {
    constructor(props){
      super(props);      
      this.state = {
        logged: false,
        user:""
      }
      this.logUser = this.logUser.bind(this);
      this.logout = this.logout.bind(this);
    }

    componentDidMount() {
      if(Cookies.get('user') !== undefined){
        this.setState({logged: true, user: Cookies.get('user')});
      }
    }

    logUser(username){
      console.log("username: ", username);
      this.setState({logged: true, user: username});
    }

    logout(){
      Cookies.remove('user');
      this.setState({logged:false, user: ""});
    }

    render(){
      if(this.state.logged){
        return (
          <div className="App">
            <header>
              <LoggedView login={this.state.user} logout={this.logout}/>
            </header>
          </div>
        );
      }
      else {
        return (
          <div className="App">
            <header className="App-header">
              <p>Witaj na naszej stronie!</p>
              <LoginView logUser={this.logUser} />
            </header>
          </div>
        );
      }
    }
}

export default App;
