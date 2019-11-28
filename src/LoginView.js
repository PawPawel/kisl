import React, { Component } from 'react';
import { Form, Button } from "react-bootstrap";
import './App.css';
import passwordHash from "password-hash";
import Cookies from 'js-cookie'
import makeCall from './utils';
import ReCAPTCHA from "react-google-recaptcha";

class LoginView extends Component {
    constructor(props) {
        super(props);
        this.state={
            login:"",
            password:"",
            message: "Witaj na naszej stronie",
            captcha: false
        }
    }
 
    login = async () => {
        if(this.state.captcha){
            var usrLogin = this.state.login+'@ask.local';
            const data = {
                username: usrLogin,
                password: this.state.password
            }
            const res = await makeCall('/api/auth', data);
            console.log("Logging", res);
            if(res === 'authenticated')
            {  
                Cookies.set('user', this.state.login);
                this.props.logUser(this.state.login);
            }
            else {
                this.setState({message: 'Nieprawidlowe dane logowania'});
            }
        }
        else{
            this.setState({message: "Potwierdź, że nie jesteś robotem"})
        }
    }

    savePassword(pass) {
        //var hashedPass = passwordHash.generate(pass);
        this.setState({password: pass});
    }


    render() {
        return(
        <div>
			<p>{this.state.message}</p>
            <Form onKeyPress={event => {if (event.key === "Enter") {this.login();}}} >
                <Form.Group controlId="formlogin">
                    <Form.Label>Login </Form.Label>
                    <Form.Control type="text" placeholder="Login" onChange={e => this.setState({login: e.target.value})}/>
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>Haslo </Form.Label>
                    <Form.Control type="password" placeholder="Haslo" onChange={e => this.savePassword(e.target.value)}/>
                </Form.Group>
                <ReCAPTCHA
                    sitekey="6LfIAsQUAAAAAH5PeLOT8b7E5SeJLHjGf3k4NlSZ"
                    onChange={() => this.setState({captcha: true})}
                />
                <Button variant="outline-info" type="button" className="form-button">
                    Zapomnialem hasla
                </Button>
                <Button variant="info" className="form-button" onClick={() => this.login()}>
                    Zaloguj
                </Button>
            </Form>
        </div>
        )
    }
}

export default LoginView;