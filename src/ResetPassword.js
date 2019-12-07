import React, { Component } from 'react';
import { Form, Button} from "react-bootstrap";
import './App.css';
import makeCall from './utils';
var crypto = require('crypto');

class ResetPassword extends Component {

  constructor(props) {
    super(props);
    this.state={
        username: "",
        password:"",
        password_repeat:"",
        message: "Podaj nowe hasło",
    }
  }

  reset = async () => {
    if(this.state.password !== this.state.password_repeat ){
      this.setState({message: 'Powtórzone hasło nie jest takie samo'});
    } 
    else if(this.state.password.length < 6){
      this.setState({message: 'Hasło musi mieć co najmniej 6 znaków'});
    }   
    else{
      //this.setState({message: this.state.password.length + ' ' + this.state.password.charAt(0) +' '+ this.state.password.charAt(1)+' '+ this.state.password.charCodeAt(2)});
      var character_ascii;
      var number=0;
      var upper_case=0;
      var lower_case=0;
      var special=0;
      for (var i = 0; i < this.state.password.length; i++) {
        character_ascii=this.state.password.charCodeAt(i);
        if(character_ascii>=48 && character_ascii<=57)number=1;//number
        else if(character_ascii>=65 && character_ascii<=90)upper_case=1;//upper_case
        else if(character_ascii>=97 && character_ascii<=122)lower_case=1;//lower_case
        else special=1;//special          
      }
      var pass_req = number+upper_case+lower_case+special;
      if(pass_req >=3){
        var usrLogin = this.state.username+'@ask.local'
        var cipher = crypto.createCipher('aes-256-ctr',usrLogin);
        var crypted = cipher.update(this.state.password,'utf8','hex')
        crypted += cipher.final('hex');

        const data = {
          username: this.state.username,
          password: crypted
        }
        const res = await makeCall('/api/change_password', data);
        if(res !== 'failed'){  
          const toknen_to_reset ={
            resetPasswordToken: this.props.match.params.token
          }
          const useless = await makeCall('/api/delete_token', toknen_to_reset);
          const path = `/login`;
          this.props.history.push(path);
        }
        else {
            this.setState({message: 'Coś poszło nie tak'});
        }
      }
      else{
        this.setState({message: 'Hasło musi zawierać trzy z czterech: małą literę, dużą literę, liczbę, znak specjalny'}); 
      }
    }    
  }

    render(){
      return(
         <header className="App-header">
           <p>{this.state.message}</p>
          <div>
            <Form onKeyPress={event => { if (event.key === "Enter") { this.reset(); } }} >
              <Form.Group controlId="formPassword">
                  <Form.Label>Hasło </Form.Label>
                  <Form.Control type="password" placeholder="Hasło" onChange={e => this.setState({ password: e.target.value })} />
              </Form.Group>
              <Form.Group controlId="formPassword_repeat">
                  <Form.Label>Powtórz hasło </Form.Label>
                  <Form.Control type="password" placeholder="powtórz hasło" onChange={e => this.setState({ password_repeat: e.target.value })} />
              </Form.Group>              
              <Button variant="info" className="form-button" onClick={() => this.reset()}>
                      Resetuj hasło
              </Button>
            </Form>
         </div>
     </header>
      )
    }

    async componentDidMount(){      
      const data = {
        resetPasswordToken: this.props.match.params.token
      }
      const res = await makeCall('/api/reset_token', data);
      if(res === 'invalid'){
        const path = `/login`;
        this.props.history.push(path);
      }  
      else if(res){
        this.setState({ username: res })
      }  
  }
}

export default ResetPassword;


