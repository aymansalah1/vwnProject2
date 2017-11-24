import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ErrorPage from './ErrorPage';

import '../css/AdminPanel.css';

export default class AdminPanel extends Component {

    static propTypes = {
        response: PropTypes.object.isRequired,
        serverLink: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.tags = this.props.response.tags;
        this.orgs = this.props.response.orgs;
        this.myToken = this.props.response.myToken;
        this.state = {
            selectedOrgId: false,
            canClick: true,
            status: 0,
            deleteIsClicked: false
        };
    }

    sendRequest = (method, path) => {
        this.setState(Object.assign({}, this.state, {canClick: false}));
        const xhr = new XMLHttpRequest();
        xhr.open(method, `${this.props.serverLink}${path}`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${this.myToken}`);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = () => {
            if ( xhr.readyState === 4 ) {
                if (xhr.status === 200) {
                    const newOrgs = {};
                    Object.keys(this.orgs).forEach(orgId => {
                        if (orgId !== this.state.selectedOrgId) {
                            newOrgs[orgId] = this.orgs[orgId];
                        }
                    });
                    this.orgs = newOrgs;
                }
                this.setState(Object.assign({}, this.state, {
                    status: xhr.status,
                    canClick: true,
                    selectedOrgId: false,
                    deleteIsClicked: false
                }));
            }
        };
        xhr.send(JSON.stringify({orgId: this.state.selectedOrgId}));
    }

    render() {
        if (this.state.status === 401 || this.state.status === 404 || this.state.status === 500) {
            return <ErrorPage status = {this.state.status} />;
        }
        else {
            return <div className = 'admin_panel_container'>
                <div id = 'left_panel'>
                    <div className ='org_list_panel'>
                        {Object.keys(this.orgs).map(orgId =>
                            <h2
                                key = {orgId}
                                className = {this.state.selectedOrgId === orgId ?
                                    'org_panel org_panel_selected' : 'org_panel'
                                }
                                onClick = {() => {this.setState(Object.assign(
                                    {}, this.state, {selectedOrgId: orgId})
                                );}}
                            >{this.orgs[orgId].name}</h2>
                        )}
                    </div>
                </div>
                <div id = 'right_panel'>
                    <div className ='org_list_panel'>
                        {this.state.selectedOrgId ?
                            <div className ='org_details_panel'>
                                <img
                                    className = 'orgLogo'
                                    src = {this.orgs[this.state.selectedOrgId].logo}
                                    alt = {`${this.orgs[this.state.selectedOrgId].name} Logo`}
                                />
                                <h1>{this.orgs[this.state.selectedOrgId].name}</h1>
                                {this.orgs[this.state.selectedOrgId].tags.map(
                                    tagId => `${this.tags[tagId]}, `
                                )}
                                <h2>Description for persons:</h2>
                                {this.orgs[this.state.selectedOrgId].description_person}
                                <h2>Description for companies:</h2>
                                {this.orgs[this.state.selectedOrgId].description_company}
                                {this.orgs[this.state.selectedOrgId].contacts.map((contact, index) =>
                                    <div key = {contact.id}>
                                        <h2>Contact{index + 1}:</h2>
                                        <p>
                                            <strong>Phone: </strong>{contact.phone}
                                            , <strong>House number: </strong>{contact.house_number}
                                            , <strong>Post code: </strong>{contact.post_code}
                                            , <strong>City: </strong>{contact.city}
                                            , <strong>Email: </strong>{contact.email}
                                            , <strong>Web address: </strong>{contact.web}
                                            , <strong>Longitude: </strong>{contact.longitude}
                                            , <strong>Latitude: </strong>{contact.latitude}
                                        </p>
                                    </div>
                                )}
                            </div> : null
                        }
                    </div>
                    <div className='submit_container'>
                        <div className='messageContainer'></div>
                        <button
                            className='reset'
                            onClick={() => {
                                if (this.state.selectedOrgId) {
                                    if (!this.state.deleteIsClicked) {
                                        this.setState(Object.assign(
                                            {}, this.state, {deleteIsClicked: true}
                                        ));
                                    }
                                    else {
                                        this.sendRequest('Delete', 'remove')
                                    }
                                }
                            }}
                        >Remove</button>
                        <button
                            className='submit'
                            onClick={() => {
                                if (this.state.selectedOrgId) {
                                    if (this.state.deleteIsClicked) {
                                        this.setState(Object.assign(
                                            {}, this.state, {deleteIsClicked: false}
                                        ));
                                    }
                                    else {
                                        this.sendRequest('Put', 'approve')
                                    }
                                }
                            }}
                        >{this.state.deleteIsClicked ? 'Cancel' : 'Approve'}</button>
                    </div>
                </div>
            </div>;
        }
    }
}