import React, {useEffect, useState} from 'react';
import './Main.css'
import { io } from 'socket.io-client';

const Main = ({inGame, logInGameHandler}) => {

    const [popUpVisible, setPopUpVisible] = useState('');
    const [popUpText, setPopUpText] = useState('');
    const [currentUserId, setCurrentUserId] = useState('You will appear here');
    const [inputActive, setInputActive] = useState('');
    const [rndText, setRndText] = useState('Text soon');

    useEffect(() => {
        if (inGame) {
            setPopUpVisible('popUp_active');
            setPopUpText(
                <>
                    <h1 className={'popup__title'}>Welcome !</h1>
                    <h2 className={'popUp__subTitle'}>{currentUserId}</h2>
                </>
            );

            setTimeout(() => {
                setPopUpVisible('');
            }, 2000);
        }
    }, [inGame])

    useEffect(() => {
        const socket = io('ws://localhost:5000');

        socket.on('client_connected', (data) => {
            setCurrentUserId(data.client_id);
        })

        socket.emit('get_random_text');

        socket.on('random_text_generated', data => {
            setRndText(data.text)
        });

        return (() => {
            socket.disconnect()
        })
    }, [])

    const [usersInput, setUsersInput] = useState('');

    const handleUserInput = (e) => {
        console.log(e.key)
    }

    return inGame ?
        (
            <main className={'main'}>
                <div className="main__car_display"></div>
                <div className={`main__random_text_container ${inputActive}`}>
                    {rndText}
                    <div className={`main__users_input_container`}>
                        {usersInput}
                    </div>
                    <textarea onBlur={() => setInputActive('')} onFocus={() => setInputActive('active')} onKeyDown={handleUserInput} name="textarea" className={'main__textarea_hidden'}></textarea>
                </div>
                <div className={`popUp ${popUpVisible}`}>
                    {popUpText}
                </div>
            </main>
        )
        :
        (
            <main className={'main'}>

                <div className="main__log_in_container">
                    <h1 className="log_in__title">
                       Your unique
                        <div className={'title__description_hover'}>
                            <div className="ID_description__container">
                                <p className="description_container__text">
                                    This ID should be user by other people to start game with you.
                                </p>
                            </div>
                            ID
                        </div>
                    </h1>
                    <h2 className="log_in__subTitle">
                        {currentUserId}
                    </h2>

                    <input type="text" className="log_in__input" placeholder={'Input room ID'}/>

                    <button className="log_in__input_button" onClick={logInGameHandler}>Log in -></button>
                </div>

            </main>
        );
};

export default Main;