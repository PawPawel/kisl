import React, { Component } from 'react';
import { Button } from "react-bootstrap";
import './App.css';

class LoggedView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "Jan",
            surname: "Kowalski",
            email: "some@email.com",
            login: ""
        }
    }

    componentDidMount(){
        this.setState({login: this.props.login });
    }

    render() {
        return(
        <div class="user-info">
            <h1> {this.state.name} {this.state.surname} </h1>
            <Button variant="info" className="form-button" onClick={() => this.props.logout()}>
                Wyloguj
            </Button>
        </div>
        )
    }
}

export default LoggedView;