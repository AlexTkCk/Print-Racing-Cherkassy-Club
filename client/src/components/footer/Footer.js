import React from 'react';
import './Footer.css'

const Footer = ({text}) => {
    return (
        <footer className={'footer'}>
            Footer {text}
        </footer>
    );
};

export default Footer;