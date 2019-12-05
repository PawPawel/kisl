import React, { Component } from 'react';
import './App.css';
import makeCall from './utils';

class ResetPassword extends Component {

    render(){
      return(
        <div className="ResetPassword">
          <p>kotek</p>
        </div>
      )
    }

    async componentDidMount(){      
      const data = {
        resetPasswordToken: this.props.match.params.token
      }
      const res = await makeCall('/api/reset_token', data);
      if(res === 'invalid'){
        const path = `/login`;
        this.props.history.push(path);
    }    
    }
}

export default ResetPassword;
