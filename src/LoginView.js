import React, { Component } from 'react';
import { Form, Button } from "react-bootstrap";
import './App.css';
import passwordHash from "password-hash";
import Cookies from 'js-cookie'

class LoginView extends Component {
    constructor(props) {
        super(props);
        this.state={
            email:"",
            password:""
        }
    }

    register() {

    }

    login() {
        console.log("Logging");
        console.log(this.state.email);
        Cookies.set('user', this.state.email);
        this.props.logUser(this.state.email);
    }

    savePassword(pass) {
        var hashedPass = passwordHash.generate(pass);
        this.setState({password: hashedPass});
    }

    render() {
        return(
        <div>
            <Form>
                <Form.Group controlId="formEmail">
                    <Form.Label>Email </Form.Label>
                    <Form.Control type="email" placeholder="Email" onChange={e => this.setState({email: e.target.value})}/>
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>Hasło </Form.Label>
                    <Form.Control type="password" placeholder="Hasło" onChange={e => this.savePassword(e.target.value)}/>
                </Form.Group>
                <Button variant="outline-info" type="submit" className="form-button" onClick={this.register()}>
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