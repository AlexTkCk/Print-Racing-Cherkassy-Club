import React, {useEffect, useState} from 'react';
import randomWords from 'random-words';
import './Main.css'
import { io } from 'socket.io-client';

const rndText = randomWords(100).join(' ');
const Main = ({inGame, logInGameHandler}) => {

    useEffect(() => {
        const socket = io('ws://localhost:5000');

        socket.on('client_connected', (data) => {
            console.log(data)
        })

        return (() => {
            socket.disconnect()
        })
    }, [])

    const [usersInput, setUsersInput] = useState('');

    return inGame ?
        (
            <main className={'main'}>
                <div className="main__car_display"></div>
                <div className="main__random_text_container">
                    {rndText}
                    <div className="main__users_input_container">
                        {usersInput}
                    </div>
                    <textarea onChange={e => {
                        setUsersInput(e.target.value);
                    }} name="textarea" className={'main__textarea_hidden'}></textarea>
                </div>
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