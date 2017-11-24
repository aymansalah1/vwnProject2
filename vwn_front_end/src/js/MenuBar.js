import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import Observable from './Observable';

import '../css/MenuBar.css';

export default class MenuBar extends Component {

    constructor() {
        super();
        this.state = {
            selectedBarItem: 0
        };
    }

    componentWillMount() {
        Observable.subscribe(this.markSelectedBarItem);
    }

    componentWillUnmount() {
        Observable.unsubscribe(this.markSelectedBarItem);
    }

    markSelectedBarItem = (action, value) => {
        if (action === 'markSelectedBarItem') {
            this.setState({
                selectedBarItem: value
            });
        }
    }

    render() {
        return <div className = 'menuBar'>
            <img
                id = 'logo'
                src = {require('../images/logo.png')}
                alt = 'VWN Logo'
            />
            <ul className = 'menuUL'>
                {this.state.selectedBarItem === 0 ?
                    <li className = 'menuBarItem activeMenuBarItem'>Home</li> :
                    <Link to={'/'}><li className = 'menuBarItem'>Home</li></Link>
                }
                {this.state.selectedBarItem === 1 ?
                    <li className = 'menuBarItem activeMenuBarItem'>Add</li> :
                    <Link to={'/add'}><li className = 'menuBarItem'>Add</li></Link>
                }
            </ul>
            
        </div>;
    }
}