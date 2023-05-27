import React, {useEffect, useState} from 'react';
import './Header.css'
import Typewriter from "typewriter-effect";

const Header = ({}) => {

    return (
        <header className={'header'}>
            <h1 className={'header__title'}>
                Print
                <Typewriter
                options={{
                    strings: ['racing'],
                    autoStart: true,
                    loop: true,
                    pauseFor: 100,
                }}
                />
            </h1>
        </header>
    );
};

export default Header;