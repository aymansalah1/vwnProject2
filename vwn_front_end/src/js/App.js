import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import Observable from './Observable';
import Loading from './Loading';
import ErrorPage from './ErrorPage';
import MenuBar from './MenuBar';
import TagsContainer from './TagsContainer';
import OrgsContainer from './OrgsContainer';
import Map from './Map';
import Add from './Add';
import Admin from './Admin';

import '../css/App.css';

export default class App extends Component {

    constructor() {
        super();
        this.serverLink = 'http://localhost:8080/';
        this.tags = {};
        this.orgs = {};
        this.state = {
            status: 0
        };
    }

    componentDidMount() {
        const xhr = new XMLHttpRequest();
        xhr.open('Get', `${this.serverLink}search`, true);
        xhr.onreadystatechange = () => {
            if ( xhr.readyState === 4 ) {
                if (xhr.status === 200) {
                    this.tags = JSON.parse(xhr.response).tags;
                    this.orgs = JSON.parse(xhr.response).orgs;
                    window.onhashchange = (e) => {
                        let oldHash;
                        if (e.oldURL.indexOf('#') === -1) {
                            oldHash = ['n', '0'];
                        }
                        else {
                            oldHash = e.oldURL.slice(e.oldURL.indexOf('#') + 1).split(',');
                        }
                        let newHash;
                        if (window.location.hash === '') {
                            newHash = ['n', '0'];
                        }
                        else {
                            newHash = window.location.hash.slice(1).split(',');
                        }
                        if (oldHash[0] !== newHash[0]) {
                            Observable.notify('orgSelection');
                        }
                        else if (oldHash[1] !== newHash[1]) {
                            Observable.notify('iAmCompany');
                        }
                        else {
                            Observable.notify('tagSelection');
                        }
                    };
                }
                this.setState({
                    status: xhr.status
                });
            }
        };
        xhr.send();
    }

    render() {
        if (this.state.status === 0) {
            return <Loading />;
        }
        if (this.state.status === 401 || this.state.status === 404 || this.state.status === 500) {
            return <ErrorPage status = {this.state.status} />;
        }
        else {
            return <Router><div className = 'route'>
                <Route path = '/admin' component = {() => <Admin
                    serverLink = {this.serverLink}
                    adminEmail = {this.adminEmail}
                />}/>
                <Route className = 'route' exact path = '/' component = {() =>
                    <div className = 'v_f_container'>
                        <MenuBar />
                        <img 
            id= 'mainFoto'
            src= {require('../images/connect1.png')}
            alt= 'connecting People for work'
            />
                        <div className = 'h_f_container'>
                            <div className = 'v_f_container h_f_element'>
                                <TagsContainer tags = {this.tags} />
                                <OrgsContainer orgs = {this.orgs} tags = {this.tags} />
                            </div>
                            <Map orgs = {this.orgs}/>
                        </div>
                    </div>
                }/>
                <Route className = 'route' path = '/add' component = {() =>
                    <div className = 'v_f_container'>
                        <MenuBar />
                        <Add tags = {this.tags} serverLink = {this.serverLink}/>
                    </div>
                }/>
            </div></Router>;
        }
    }
}