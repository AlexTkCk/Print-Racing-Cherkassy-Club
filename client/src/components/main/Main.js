import React from 'react';
import './Main.css'

const Main = ({inGame, logInGameHandler}) => {
    return inGame ?
        (
            <main className={'main'}>
                <button onClick={logInGameHandler}></button>
                Gaming
            </main>
        )
        :
        (
            <main className={'main'}>
                <button onClick={logInGameHandler}></button>
                Not gaming
            </main>
        );
};

export default Main;