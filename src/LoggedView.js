import React, { Component } from 'react';
import { Button, Table, Navbar, Accordion, Card, ListGroup, Modal, Form } from "react-bootstrap";
import './App.css';
import makeCall from './utils';
import Cookies from 'js-cookie';
import AdminView from './AdminView';
import ReCAPTCHA from "react-google-recaptcha";
var crypto = require('crypto');

class LoggedView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            name: "",
            lastname: "",
            email: "",
            login: "",
            password: "",
            password_repeat: "",
            captcha_reset: true,
            showResetPasswordForm: false,
            message_reset: "Wprowadź hasło",
            opis: "ten użytkownik nie ma opisu",
            groups: []
        }
        this.logout = this.logout.bind(this);
    }

    async componentDidMount() {
        const data = {
            username: this.props.match.params.username + '@ask.local',
        }
        const res = await makeCall('/api/validateToken', data);
        console.log(res);
        if (res === 'invalid') {
            const path = `/login`;
            this.props.history.push(path);
        }
        else {
            this.setState({ login: this.props.match.params.username },
                async function () {
                    console.log(this.state);
                    if (this.state.login !== 'admin') {
                        this.getUserData();
                        this.getGroups();                        
                    }
                }
            );
        }
    }

    getUserData = async () => {
        const data = {
            username: this.state.login
        }
        const res = await makeCall('/api/user', data);
        this.setState({ user: res, name: res.givenName, lastname: res.sn, email: res.userPrincipalName});          
        if(res.description) this.setState({opis: res.description});
    }

    getGroups = async () => {
        const data = {
            username: this.state.login + '@ask.local'
        }
        const res = await makeCall('/api/groups', data);
        var groups = res.map(item => item['cn']);
        this.setState({ groups });
        console.log(this.state);
    }

    createListItem(item) {
        return (
            <ListGroup.Item key={item}>{item}</ListGroup.Item>
        )
    }

    logout() {
        this.setState({ logged: false, user: "" });
        const path = `/login`;
        this.props.history.push(path);
    }
    resetPassword = async (e) => {
        e.preventDefault();
        console.log("108 pass: ",this.state.password);
        console.log("108 pass_res: ",this.state.password_repeat);
        if (this.state.captcha_reset) {
            if (this.state.password !== this.state.password_repeat) {
                this.setState({ message_reset: 'Powtórzone hasło nie jest takie samo' });
            }
            else if (this.state.password.length < 6) {
                this.setState({ message_reset: 'Hasło musi mieć co najmniej 6 znaków' });
            }
            else{
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
                  var usrLogin = this.props.match.params.username+'@ask.local'
                  var cipher = crypto.createCipher('aes-256-ctr',usrLogin);
                  var crypted = cipher.update(this.state.password,'utf8','hex')
                  crypted += cipher.final('hex');
                  console.log("108 username: ",this.props.match.params.username);

                  const data = {
                    username: this.props.match.params.username,
                    password: crypted
                  }
                  const res = await makeCall('/api/change_password', data);
                  if(res !== 'failed'){ 
                    this.setState({ showResetPasswordForm: false })
                  }
                  else this.setState({message_reset: 'Niestety nie udało się zmienic hasła'}); 
                }
                else this.setState({message_reset: 'Hasło musi zawierać trzy z czterech: małą literę, dużą literę, liczbę, znak specjalny'}); 
            }  
        }
        else this.setState({ message_reset: "Potwierdź, że nie jesteś robotem" });
    };
    
    render() {
        if (this.state.login !== 'admin') {
            return (
                <div className="user-info">
                    <Navbar className="logged-header">
                        <Navbar.Brand id="nav-header"> Witaj, {this.state.login} </Navbar.Brand>
                        <Navbar.Collapse className="justify-content-end">
                            <Button variant="outline-info" type="button" className="form-button" onClick={() => { this.setState({ showResetPasswordForm: true }) }}>
                                Zmień hasło
                        </Button>
                            <Button variant="info" className="form-button" onClick={() => this.logout()}>
                                Wyloguj
                        </Button>
                        </Navbar.Collapse>
                    </Navbar>
                    <div className="user-container">
                        <Table striped bordered hover variant="dark">
                            <tbody>
                                <tr>
                                    <th> Imię i nazwisko </th>
                                    <td>{this.state.name} {this.state.lastname}</td>
                                </tr>
                                <tr>
                                    <th>
                                        Login
                                    </th>
                                    <td>
                                        {this.state.login}
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        Email
                                    </th>
                                    <td>
                                        {this.state.email}
                                    </td>
                                </tr>                                
                                <tr>
                                    <th>
                                        Opis
                                    </th>
                                    <td>
                                        {this.state.opis}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <Accordion className="accordion">
                            <Card>
                                <Card.Header>
                                    <Accordion.Toggle as={Button} variant="info" eventKey="0">
                                        Pokaż Grupy
                                </Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>
                                        <ListGroup>
                                            {this.state.groups.map((i) => this.createListItem(i))}
                                        </ListGroup>
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    </div>
                    <Modal show={this.state.showResetPasswordForm} onHide={() => { this.setState({ showResetPasswordForm: false }) }}>
                        <Modal.Header closeButton>
                            <Modal.Title>Zmień hasło</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={this.resetPassword}>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>{this.state.message_reset}</Form.Label>
                                    <Form.Control type="password" placeholder="Hasło" onChange={e => this.setState({ password: e.target.value })} />
                                </Form.Group>
                                <Form.Group controlId="formPassword_repeat">
                                    <Form.Label>powtórz hasło </Form.Label>
                                    <Form.Control type="password" placeholder="Powtórz hasło" onChange={e => this.setState({ password_repeat: e.target.value })} />
                                </Form.Group>
                                <ReCAPTCHA
                                    sitekey="6LfIAsQUAAAAAH5PeLOT8b7E5SeJLHjGf3k4NlSZ"
                                    onChange={() => this.setState({ captcha_reset: true })}
                                />
                                <Button variant="primary" type="submit" >
                                    Resetuj hasło
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </div>
            )
        }
        else {
            return (
                <div className="user-info">
                    <Navbar className="logged-header">
                        <Navbar.Brand id="nav-header"> Witaj, {this.state.login} </Navbar.Brand>
                        <Navbar.Collapse className="justify-content-end">
                            <Button variant="outline-info" className="form-button" onClick={() => this.props.logout()}>
                                Zmień hasło
                            </Button>
                            <Button variant="info" className="form-button" onClick={() => this.logout()}>
                                Wyloguj
                            </Button>
                        </Navbar.Collapse>
                    </Navbar>
                    <AdminView />
                </div>
            )

        }
    }

}

export default LoggedView;