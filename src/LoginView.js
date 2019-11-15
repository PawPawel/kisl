import React, { Component } from 'react';
import { Form, Button } from "react-bootstrap";
import './App.css';
import passwordHash from "password-hash";
import Cookies from 'js-cookie'

class LoginView extends Component {
    constructor(props) {
        super(props);
        this.state={
            login:"",
            password:""
        }
    }

    login() {
        console.log("Logging");
        console.log(this.state.login);
        Cookies.set('user', this.state.login);
        this.props.logUser(this.state.login);
    }

    savePassword(pass) {
        var hashedPass = passwordHash.generate(pass);
        this.setState({password: hashedPass});
    }

    render() {
        return(
        <div>
            <Form>
                <Form.Group controlId="formlogin">
                    <Form.Label>Login </Form.Label>
                    <Form.Control type="text" placeholder="Login" onChange={e => this.setState({login: e.target.value})}/>
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>Hasło </Form.Label>
                    <Form.Control type="password" placeholder="Hasło" onChange={e => this.savePassword(e.target.value)}/>
                </Form.Group>
                <Button variant="outline-info" type="submit" className="form-button">
                    Zarejestruj
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