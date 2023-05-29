import React, {useEffect, useState} from 'react';
import randomWords from 'random-words';
import './Main.css'
import { io } from 'socket.io-client';

const rndText = randomWords(100).join(' ');
const Main = ({inGame, logInGameHandler}) => {

    const [popUpVisible, setPopUpVisible] = useState('');
    const [popUpText, setPopUpText] = useState('');

    useEffect(() => {
        const socket = io('ws://localhost:5000');

        socket.on('client_connected', (data) => {
            setPopUpVisible('popUp_active');
            setPopUpText(
                <>
                    <h1 className={'popup__title'}>Welcome !</h1>
                    <h2 className={'popUp__subTitle'}>{data.client_id}</h2>
                </>
            );

            setTimeout(() => {
                setPopUpVisible('');
            }, 2000);
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
                <div className={`popUp ${popUpVisible}`}>
                    {popUpText}
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