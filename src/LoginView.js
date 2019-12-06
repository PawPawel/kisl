import React, { Component } from 'react';
import { Form, Button, Modal} from "react-bootstrap";
import './App.css';
import Cookies from 'js-cookie'
import makeCall from './utils';
import ReCAPTCHA from "react-google-recaptcha";
var crypto = require('crypto');

class LoginView extends Component {
    constructor(props) {
        super(props);
        this.state={
            login:"",
            password:"",
            message: "Witaj na naszej stronie",
            captcha: true,
            showResetPasswordForm: false,
            email: ""
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
            if(res !== 'failed')
            {  
                console.log(res);
                
                const path = `/userProfile/${this.state.login}`;
                this.props.history.push(path);
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
        var usrLogin = this.state.login+'@ask.local'
        var cipher = crypto.createCipher('aes-256-ctr',usrLogin);
        var crypted = cipher.update(pass,'utf8','hex')
        crypted += cipher.final('hex');

        this.setState({password: crypted});
    }    

    sendEmail = async (e) => {  
        e.preventDefault();               
        if(this.state.email !== ''){
            const data = {
                email: this.state.email
            }
            const res = await makeCall('/api/findEmail', data);
            console.log('here is the res in LoginView: ', res);

            if(res !== undefined)
            {                   
                this.setState({message: 'Wysłano maila na adres: ' + this.state.email});
            }
        }
        else {
            this.setState({message: 'Nie podano maila'});
        }
        this.setState({ showResetPasswordForm: false })
    };

    render() {        
        return (
            <header className="App-header">
                <p>{this.state.message}</p>
                <div>
                    <Form onKeyPress={event => { if (event.key === "Enter") { this.login(); } }} >
                        <Form.Group controlId="formlogin">
                            <Form.Label>Login </Form.Label>
                            <Form.Control type="text" placeholder="Login" onChange={e => this.setState({ login: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Haslo </Form.Label>
                            <Form.Control type="password" placeholder="Haslo" onChange={e => this.savePassword(e.target.value)} />
                        </Form.Group>
                        <ReCAPTCHA
                            sitekey="6LfIAsQUAAAAAH5PeLOT8b7E5SeJLHjGf3k4NlSZ"
                            onChange={() => this.setState({ captcha: true })}
                        />
                        <Button variant="outline-info" type="button" className="form-button" onClick={() => { this.setState({ showResetPasswordForm: true }) }}>
                            Zapomnialem hasla
                    </Button>
                        <Button variant="info" className="form-button" onClick={() => this.login()}>
                            Zaloguj
                    </Button>
                    </Form>
                    <Modal show={this.state.showResetPasswordForm} onHide={() => { this.setState({ showResetPasswordForm: false }) }}>
                        <Modal.Header closeButton>
                            <Modal.Title>Resetuj hasło</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={this.sendEmail}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Wprowadź adres e-mail aby zresetować swoje hasło</Form.Label>
                                    <Form.Control type="email" placeholder="Email" onChange={e => this.setState({ email: e.target.value })} />
                                </Form.Group>
                                <Button variant="primary" type="submit" >
                                    Resetuj hasło
                        </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </div>
            </header>
        )        
    }
}
export default LoginView;

