import React, { Component } from 'react';
import { Button, Table, Navbar, Accordion, Card, ListGroup} from "react-bootstrap";
import './App.css';
import makeCall from './utils';
import Cookies from 'js-cookie';

class LoggedView extends Component {
    constructor(props) {
        super(props);
        this.state = {
			user: {},
            name: "",
			lastname:"",
            email: "",
            login: "",
            groups: ["grupa1", "grupa2", "grupa3"]
        }
    }

    async componentDidMount(){
        const data = {
            username: this.props.match.params.username+'@ask.local',
			token: localStorage.getItem('valToken')
		}
        const res = await makeCall('/api/validateToken', data);
        console.log(res);
        if(res === 'invalid'){
            const path = `/login`;
            this.props.history.push(path);
        }
        else{
            this.setState({login: this.props.match.params.username}, 	
                function() { 
                    this.getUserData();
                    this.getGroups();
                }
            );
        }
    }

    getUserData = async () => {
		const data = {
			username: this.state.login
		}
		const res = await makeCall('/api/user', data);
		this.setState({user: res, name: res.givenName, lastname: res.sn, email: res.userPrincipalName});
    }
	
	getGroups = async () => {
		const data = {
			username: this.state.login + '@ask.local'
		}
		const res = await makeCall('/api/groups', data);
		var groups = res.map(item => item['cn']);
        this.setState({groups});
        console.log(this.state);
	}
	
    createListItem(item){
        return(
            <ListGroup.Item key={item}>{item}</ListGroup.Item>
        )
    }

    logout(){
        Cookies.remove('user');
        this.setState({logged:false, user: ""});
        const path = `/login`;
        this.props.history.push(path);
    }
    
    render() {
        return(
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
                    </tbody>
                </Table>
                <Accordion id="groups-accordion">
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

        </div>
        )
    }
}

export default LoggedView;