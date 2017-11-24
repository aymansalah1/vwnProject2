import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Loading from './Loading';
import ErrorPage from './ErrorPage';
import AdminPanel from './AdminPanel';

import '../css/Admin.css';

export default class Admin extends Component {

    static propTypes = {
        serverLink: PropTypes.string.isRequired
    };

    constructor() {
        super();
        this.response = {};
        this.state = {
            status: 0,
            username: '',
            password: ''
        };
    }

    submit = (e) => {
        e.preventDefault();
        this.setState(Object.assign({}, this.state, {status: 1}));
        const xhr = new XMLHttpRequest();
        xhr.open('Post', `${this.props.serverLink}login`, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = () => {
            if ( xhr.readyState === 4 ) {
                if (xhr.status === 200) {
                    this.response = JSON.parse(xhr.response);
                }
                this.setState(Object.assign({}, this.state, {status: xhr.status}));
            }
        };
        xhr.send(JSON.stringify({
            username: this.state.username,
            password: this.state.password
        }));
    }

    render() {
        if (this.state.status === 0) {
            return <div className = 'login_container'>
                <form className='login_form' onSubmit={this.submit}>
                    Username:
                    <input
                        type = 'text'
                        className = 'login_input'
                        value = {this.state.username}
                        onChange = {e => {this.setState(Object.assign(
                            {}, this.state, {username: e.target.value}
                        ));}}
                    />
                    Password:
                    <input
                        type = 'password'
                        className = 'login_input'
                        value = {this.state.password}
                        onChange = {e => {this.setState(Object.assign(
                            {}, this.state, {password: e.target.value}
                        ));}}
                    />
                    <input type = 'submit' value = 'Login' className='submit' />                    
                </form>
            </div>;
        }
        else if (this.state.status === 1) {
            return <Loading />;
        }
        if (this.state.status === 401 || this.state.status === 404 || this.state.status === 500) {
            return <ErrorPage status = {this.state.status} />;
        }
        else if (this.state.status === 200) {
            return <AdminPanel response = {this.response} serverLink = {this.props.serverLink}/>;
        }
    }
}