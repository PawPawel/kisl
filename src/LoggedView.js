import React, { Component } from 'react';
import { Button, Table, Navbar, Accordion, Card, ListGroup} from "react-bootstrap";
import './App.css';

class LoggedView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "Jan",
            surname: "Kowalski",
            email: "some@email.com",
            login: "",
            groups: ["grupa1", "grupa2", "grupa3"]
        }
    }

    componentDidMount(){
        this.setState({login: this.props.login});
    }

    createListItem(item){
        return(
            <ListGroup.Item key={item}>{item}</ListGroup.Item>
        )
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
                    <Button variant="info" className="form-button" onClick={() => this.props.logout()}>
                            Wyloguj
                    </Button>
                </Navbar.Collapse>
            </Navbar>
            <div className="user-container">
                <Table striped bordered hover variant="dark">
                    <tbody>
                        <tr>
                            <th> Imię i nazwisko </th>
                            <td>{this.state.name} {this.state.surname}</td>
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