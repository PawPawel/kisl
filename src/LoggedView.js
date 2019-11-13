import React, { Component } from 'react';
import { Button } from "react-bootstrap";
import './App.css';

class LoggedView extends Component {
    constructor(props) {
        super(props);
        this.state={
            email:""
        }
    }

    componentDidMount(){
        this.setState({email: this.props.email});
    }

    render() {
        return(
        <div>
            <Button variant="info" className="form-button" onClick={() => this.login()}>
                    Zaloguj
                </Button>
        </div>
        )
    }
}

export default LoggedView;