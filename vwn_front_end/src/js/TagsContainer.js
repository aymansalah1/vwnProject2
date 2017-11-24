import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Observable from './Observable';

import '../css/TagsContainer.css';

export default class TagsContainer extends PureComponent {

    static propTypes = { tags: PropTypes.object.isRequired };

    componentWillMount() {
        this.setState({
            selectedTags: this.tagSelectionHandler(),
            iAmCompany: this.iAmCompanyHandler()
        });
        Observable.subscribe(this.renderTags);
        Observable.notify('markSelectedBarItem', 0);
    }

    componentWillUnmount() {
        Observable.unsubscribe(this.renderTags);
    }

    iAmCompanyHandler = () => {
        let iAmCompany = '0';
        if (window.location.hash !== '') {
            iAmCompany = window.location.hash.slice(1).split(',')[1];
        }
        return iAmCompany;
    }

    tagSelectionHandler = () => {
        const selectedTags = {};
        const hash = window.location.hash;
        if (hash !== '') {
            hash.slice(1).split(',').slice(2).forEach(tagId => {
                selectedTags[tagId] = true;
            });
        }
        return selectedTags;
    }

    renderTags = (action) => {
        if (action === 'tagSelection') {
            this.setState({
                selectedTags: this.tagSelectionHandler(),
                iAmCompany: this.state.iAmCompany
            });
        }
        else if (action === 'iAmCompany') {
            this.setState({
                selectedTags: this.state.selectedTags,
                iAmCompany: this.iAmCompanyHandler()
            });
        }
    }

    setHash = (iAmCompany, selectedTags) => {
        let selectedOrgId = 'n';
        if (window.location.hash !== '') {
            selectedOrgId = window.location.hash.slice(1).split(',')[0];
        }
        let hash = `${selectedOrgId},${iAmCompany}`;
        for (const id in selectedTags) {
            if(selectedTags[id]) {
                hash += `,${id}`;
            }
        }
        window.location.hash = hash;
    }

    render() {
        return <div className = 'mainContainer'>
            <div className = 'tagsContainer'>
                {Object.keys(this.props.tags).map(tagId => {
                    return <button
                        key = {tagId}
                        className = {this.state.selectedTags[tagId] ? 'btn btnSelected' : 'btn'}
                        onClick = {() => {
                            const selectedTags = Object.assign({}, this.state.selectedTags);
                            selectedTags[tagId] = !selectedTags[tagId];
                            this.setHash(this.state.iAmCompany, selectedTags);
                        }}
                    >{this.props.tags[tagId]}</button>;
                })}
            </div>
            <div className = 'toggleContainer'>
                <button
                    className = {this.state.iAmCompany === '1' ?
                        'btn tButtonLeft' : 'btn tButtonLeft btnSelected'}
                    onClick = {() => {
                        if (this.state.iAmCompany === '1') {
                            this.setHash('0', this.state.selectedTags);
                        }
                    }}
                >I am newcomer</button>
                <button
                    className = {this.state.iAmCompany === '0' ?
                        'btn tButtonRight' : 'btn tButtonRight btnSelected'}
                    onClick = {() => {
                        if (this.state.iAmCompany === '0') {
                            this.setHash('1', this.state.selectedTags);
                        }
                    }}
                >I am company</button>
            </div>
        </div>;
    }
}