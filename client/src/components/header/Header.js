import React, {useEffect, useState} from 'react';
import './Header.css'

const Header = ({}) => {

    const [titleContent, setTitleContent] = useState('Print');
    const [titleCursorClass, setTitleCursorClass] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setTitleCursorClass(prevState => prevState === 'active' ? '' : 'active');
        }, 500);

        return () => {
            clearInterval(interval);
        }
    });


    return (
        <header className={'header'}>
            <h1 className={'header__title'}>
                <div className={`header__title_cursor ${titleCursorClass}`}>
                </div>
                {titleContent}
            </h1>
        </header>
    );
};

export default Header;