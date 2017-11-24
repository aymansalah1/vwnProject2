import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Observable from './Observable';

import '../css/OrgDetails.css';

export default class OrgDetails extends PureComponent {

    static propTypes = {
        org: PropTypes.object.isRequired,
        tags: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            iAmCompany: this.iAmCompanyHandler(),
            selected: this.orgSelectionHandler()
        };
    }

    componentWillMount() {
        Observable.subscribe(this.renderOrg);
    }

    componentWillUnmount() {
        Observable.unsubscribe(this.renderOrg);
    }

    iAmCompanyHandler = () => {
        let iAmCompany = '0';
        if (window.location.hash !== '') {
            iAmCompany = window.location.hash.slice(1).split(',')[1];
        }
        return iAmCompany;
    }

    orgSelectionHandler = () => {
        let selectedOrgId = 'n';
        const hash = window.location.hash;
        if (hash !== '') {
            selectedOrgId = hash.slice(1, hash.indexOf(','));
        }
        if (selectedOrgId === this.props.org.id) {
            return true;
        }
        return false;
    }

    renderOrg = (action) => {
        if (action === 'orgSelection') {
            const selected = this.orgSelectionHandler();
            if (this.state.selected !== selected) {
                this.setState({
                    iAmCompany: this.iAmCompanyHandler(),
                    selected: selected
                });
            }
        }
        else if (action === 'iAmCompany') {
            if (this.state.selected) {
            this.setState({
                iAmCompany: this.iAmCompanyHandler(),
                selected: true
            });
        }}
    }

    componentDidMount(){
        if (this.state.selected) {
            this.selectedOrg.scrollIntoView({behavior: "smooth", block: "start"});
        }
    }

    componentDidUpdate(){
        if (this.state.selected) {
            this.selectedOrg.scrollIntoView({behavior: "smooth", block: "start"});
        }
    }

    render() {
        const org = this.props.org;
        const tags = this.props.tags;
        return <div>
            <div
                ref = {input => {this.selectedOrg = input;}}
                className = 'orgDetails'
                onClick = {() => {
                    const hash = window.location.hash;
                    if (hash === '') {
                        window.location.hash = `${org.id},0`;
                    }
                    else {
                        if(hash.slice(1, hash.indexOf(',')) === org.id) {
                            window.location.hash = `n${hash.slice(hash.indexOf(','))}`;
                        }
                        else {
                            window.location.hash = `${org.id}${hash.slice(hash.indexOf(','))}`;
                        }
                    }
                }}
            >
                <h1 className = 'orgName'>{org.name}</h1>
                <div className = 'spanContainer'>
                    {org.tags.map(tag => <span
                        key = {tag}
                        className =
                            {org.matchingTags[tag] ? 'tag tagSelected' : 'tag'}
                    >{tags[tag]}</span>)}
                </div>
            </div>
            {this.state.selected ? <div className = 'orgSelected'>
                <div className = 'orgLogoContainer'>
                    <img
                        className = 'orgLogo'
                        src = {org.logo}
                        alt = {`${org.name} Logo`}
                    />
                </div>
                <h2>Description:</h2>
                <p>{this.state.iAmCompany === '1' ? org.description_company : org.description_person}</p>
                <h2>Contact details:</h2>
                <div>
                    {org.contacts.map((contact, index) => <div key = {contact.id}>
                        {index !== 0 ? <hr/> : null}
                        <strong>Phone:</strong> {contact.phone}<br/>
                        <strong>Email:</strong> <a href = {`mailto:${contact.email}`}>
                            {contact.email}</a><br/>
                        <strong>Website:</strong> <a href = {contact.web} target = '_blank'>
                            {contact.web}</a><br/>
                        <strong>City:</strong> {contact.city}
                    </div>)}
                </div>
            </div> : null}
        </div>;
    }
}