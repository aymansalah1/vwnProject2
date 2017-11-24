import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Observable from './Observable';

import '../css/Map.css';

const maps = window.google.maps;

export default class Map extends Component {

    static propTypes = { orgs: PropTypes.object.isRequired };

    componentDidMount() {
        this.markers = [];
        this.map = new maps.Map(this.mapDiv, {
            zoom: 7,
            center: {
                lat: 52.153406,
                lng: 5.292707
            }
        });
        this.selectedOrgId = this.orgSelectionHandler();
        this.matchingOrgsIds = this.tagSelectionHandler();
        this.renderMarkers();
        Observable.subscribe(this.renderMap);
    }

    componentWillUnmount() {
        Observable.unsubscribe(this.renderMap);
    }

    orgSelectionHandler = () => {
        let selectedOrgId = 'n';
        const hash = window.location.hash;
        if (hash !== '') {
            selectedOrgId = hash.slice(1, hash.indexOf(','));
        }
        return selectedOrgId;
    }

    tagSelectionHandler = () => {
        const matchingOrgsIds = [];
        const orgs = this.props.orgs;
        const hash = window.location.hash;
        if (hash === '' || hash.slice(1).split(',').length < 3 ) {
            for (const orgId in orgs) {
                matchingOrgsIds.push(orgId);
            }
        }
        else {
            const selectedTags = {};
            hash.slice(1).split(',').slice(2).forEach(tagId => {
                selectedTags[tagId] = true;
            });
            for (const orgId in orgs) {
                const tags = orgs[orgId].tags;
                for (let i=0 ; i<tags.length ; i++) {
                    if (selectedTags[tags[i]]) {
                        matchingOrgsIds.push(orgId);
                        break;
                    }
                }
            }
        }
        return matchingOrgsIds;
    }

    renderMap = (action) => {
        if (action === 'orgSelection') {
            this.selectedOrgId = this.orgSelectionHandler();
            this.renderMarkers();
        }
        else if (action === 'tagSelection') {
            this.matchingOrgsIds = this.tagSelectionHandler();
            this.renderMarkers();
        }
    }

    renderMarkers = () => {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.markers = [];
        const orgs = this.props.orgs;
        this.matchingOrgsIds.forEach(orgId => {
            orgs[orgId].contacts.forEach(contact => {
                const marker = new maps.Marker({
                    position: {
                        lat: contact.latitude,
                        lng: contact.longitude
                    },
                    map: this.map,
                    icon: require(`../images/marker_${orgId === this.selectedOrgId ?
                        'selected' : 'normal'}.png`)
                });
                this.markers.push(marker);
                if (orgId === this.selectedOrgId) {
                    new maps.InfoWindow({
                        content: `<strong>${orgs[orgId].name}</strong><br/>
                            <strong>Post code:</strong> ${contact.post_code} ${contact.city}<br/>
                            <strong>House number:</strong> ${contact.house_number}`
                    }).open(this.map, marker);
                }
                marker.addListener('click', () => {
                    const hash = window.location.hash;
                    if (hash === '') {
                        window.location.hash = `${orgId},0`;
                    }
                    else if (hash.slice(1, hash.indexOf(',')) === orgId) {
                        window.location.hash = `n${hash.slice(hash.indexOf(','))}`;
                    }
                    else {
                        window.location.hash = `${orgId}${hash.slice(hash.indexOf(','))}`;
                    }
                });
            });
        });
    }

    render() {
        return <div ref = {input => {this.mapDiv = input;}} className = 'mapDiv' />;
    }
}