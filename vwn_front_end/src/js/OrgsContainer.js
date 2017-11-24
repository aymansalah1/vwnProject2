import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Observable from './Observable';
import OrgDetails from './OrgDetails';

import '../css/OrgsContainer.css';

export default class OrgsContainer extends Component {

    static propTypes = {
        orgs: PropTypes.object.isRequired,
        tags: PropTypes.object.isRequired
    };

    componentWillMount() {
        this.renderOrgs('tagSelection');
        Observable.subscribe(this.renderOrgs);
    }

    componentWillUnmount() {
        Observable.unsubscribe(this.renderOrgs);
    }

    renderOrgs = (action) => {
        if (action === 'tagSelection') {
            const matchingOrgs = {};
            const orgs = this.props.orgs;
            const hash = window.location.hash;
            if (hash === '' || hash.slice(1).split(',').length < 3 ) {
                for (const orgId in orgs) {
                    matchingOrgs[orgId] = Object.assign({}, orgs[orgId]);
                    matchingOrgs[orgId].id = orgId;
                    matchingOrgs[orgId].matchingTags = {};
                }
            }
            else {
                const selectedTags = {};
                hash.slice(1).split(',').slice(2).forEach(tagId => {
                    selectedTags[tagId] = true;
                });
                for (const orgId in orgs) {
                    let matchingOrg = {};
                    const org = orgs[orgId];
                    org.tags.forEach(tagId => {
                        if (selectedTags[tagId]) {
                            if (matchingOrg.name === undefined) {
                                matchingOrg = Object.assign({}, org);
                                matchingOrg.id = orgId;
                                matchingOrg.matchingTags = {};
                            }
                            matchingOrg.matchingTags[tagId] = true;
                        }
                    });
                    if (matchingOrg.name !== undefined) {
                        matchingOrgs[orgId] = matchingOrg;
                    }
                }
            }
            this.setState({
                matchingOrgs: matchingOrgs
            });
        }
    }

    render() {
        const tags = this.props.tags;
        const matchingOrgs = this.state.matchingOrgs;
        return <div className ="v_f_element">
            {Object.keys(matchingOrgs).map(orgId =>
                <OrgDetails
                    key = {orgId}
                    org = {matchingOrgs[orgId]}
                    tags = {tags}
                />
            )}
        </div>;
    }
}