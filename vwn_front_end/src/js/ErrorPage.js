import React from 'react';
import PropTypes from 'prop-types';

import '../css/ErrorPage.css';

const ErrorPage = ({status}) => {
    let errorHeader = '';
    let errorMessage = '';
    if (status === 401) {
        errorHeader = 'UNAUTHORIZED ACCESS';
        errorMessage = 'You have attempted to access a page that you are not authorized to view.';
    }
    else if (status === 404) {
        errorHeader = 'PAGE NOT FOUND';
        errorMessage = 'The link you clicked may be broken or the page may have been removed.';
    }
    else if (status === 500) {
        errorHeader = 'INTERNAL SERVER ERROR';
        errorMessage = `The server encountered an internal error
            or misconfiguration and was unable to complete your request.`;
    }
    return <div className = 'error_container'>
        <h1 className = 'error_number'><strong>{status}</strong></h1>
        <h2>{errorHeader}</h2>
        <p>{errorMessage}</p>
    </div>;
};

ErrorPage.propTypes = { status: PropTypes.number.isRequired };

export default ErrorPage;