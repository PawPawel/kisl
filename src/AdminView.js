import React, { Component } from 'react';
import { Button,DropdownButton, Tooltip, OverlayTrigger, Accordion, Card, ListGroup, Dropdown, InputGroup} from "react-bootstrap";
import './App.css';
import makeCall from './utils';


class AdminView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            groups: []
        }
    }

    async componentDidMount(){
       const users = await makeCall('/api/findUsers', {});
       this.setState({users});
       const groups = await makeCall('/api/findGroups', {});
       groups.map(gr => {
           gr['users'] = [];
       })
       this.setState({groups});
    }

    async getUsersForGroup(groupName){
        const users = await makeCall('/api/usersForGroup', {groupName: groupName});
        var groups = this.state.groups;
        var group = groups.find(function(g){
            return g.cn == groupName;
        })
        var i = groups.indexOf(group);
        group['users'] = users;
        groups[i] = group;
        this.setState({groups});
    }

    createListItem(item){
        return(
            <ListGroup.Item key={item}>{item}</ListGroup.Item>
        )
    }
    
    createGroupItem(item){
        return(
            <ListGroup.Item key={item.cn}>
                <OverlayTrigger overlay={
                        <Tooltip id={`tooltip`}>{item.description} </Tooltip>
                    }>
                    <Accordion>
                        <Accordion.Toggle as={Button} onClick={() => this.getUsersForGroup(item.cn)} variant="link" eventKey="0">
                           {item.cn}
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <ListGroup>
                                    {item.users.map((i) => this.createListItem(i))}
                                </ListGroup>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Accordion>
                </OverlayTrigger>
            </ListGroup.Item>
        )
    }

    render() {
        return(
        <div className="admin-info">
            <div className="admin-container">
             <Accordion className="accordion" id="users-acc">
                <Card>
                    <Card.Header>
                        <Accordion.Toggle as={Button} variant="info" eventKey="0">
                            Pokaż użytkowników
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <ListGroup>
                                {this.state.users.map((i) => this.createListItem(i))}
                            </ListGroup>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
            <Accordion className="accordion" id="groups-acc">
                <Card>
                    <Card.Header>
                        <Accordion.Toggle as={Button} variant="info" eventKey="0">
                            Pokaż grupy
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <ListGroup>
                                {this.state.groups.map((i) => this.createGroupItem(i))}
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

export default AdminView;