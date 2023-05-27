import React from 'react';
import './Header.css'

const Header = ({text}) => {
    return (
        <header className={'header'}>
            <h1>Header {text}</h1>
        </header>
    );
};

export default Header;