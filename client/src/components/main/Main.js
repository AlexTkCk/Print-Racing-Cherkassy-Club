import React, {useEffect, useState} from 'react';
import './Main.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'

import {socket} from '../../socket'

const Main = () => {
    const [popUpVisible, setPopUpVisible] = useState('');
    const [popUpText, setPopUpText] = useState('');
    const [currentUserId, setCurrentUserId] = useState('Your id will appear here');
    const [inputActive, setInputActive] = useState('');
    const [inGame, setInGame] = useState(false);
    const [connectID, setConnectID] = useState('');
    const [roomData, setRoomData] = useState({});
    const [gameRequests, setGameRequests] = useState([]);

    const logInGameHandler = (e) => {
        socket.emit('connect_to_client', {
            connectID: e.target.value,
        })
    }

    useEffect(() => {
        if (inGame) {

        }
    }, [inGame])

    useEffect(() => {
        socket.on('client_connected', (data) => {
            setCurrentUserId(data.client_id);
        })

        socket.on('connecting_successful', data => {
            setRoomData(data);
        })

        socket.on('connecting_unsuccessful', () => {
            setPopUpVisible('popUp_active');
            setPopUpText(
                <>
                    <h1 className={'popup__title'}>Error !</h1>
                    <h2 className={'popUp__subTitle'}>User is not exist, or declined.</h2>
                </>
            );
            setTimeout(() => {
                setPopUpVisible('');
            }, 2000);
        })

        socket.on('new_game_request', data => {
            setGameRequests(prevState => [...prevState, data])
        })

        socket.on('timer_update', data => {
            console.log(data)
        })

        return socket.disconnect;
    }, [socket])

    const [usersInput, setUsersInput] = useState('');

    const handleUserInput = (e) => {
        console.log(e.key)
    }

    return inGame ?
        (
            <main className={'main'}>
                <div className="main__car_display"></div>
                <div className={`main__random_text_container ${inputActive}`}>
                    {roomData.text}
                    <div className={`main__users_input_container`}>
                        {usersInput}
                    </div>
                    <textarea onBlur={() => setInputActive('')} onFocus={() => setInputActive('active')} onKeyDown={handleUserInput} name="textarea" className={'main__textarea_hidden'}></textarea>
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
                                    This ID should be used by other people to start game with you.
                                </p>
                            </div>
                            ID
                        </div>
                    </h1>
                    <h2 className="log_in__subTitle">
                        {currentUserId}
                    </h2>

                    <input type="text" className="log_in__input" placeholder={'Input room ID'} onChange={(e) => setConnectID(e.target.value)}/>

                    <button className="log_in__input_button" onClick={logInGameHandler} value={connectID}>Log in -></button>
                </div>
                <div className={`popUp ${popUpVisible}`}>
                    {popUpText}
                </div>

                <div className="requests_container">
                    {gameRequests.map((request, index)=> {
                            return (<div key={index} className={'request'}>
                                <h1 className={'request_title'}>{request.id} challenges you!</h1>
                                <div className="request__buttons_container">
                                    <button className="request__choice_button button_accept">
                                        <FontAwesomeIcon icon={faCheck} /> Accept</button>
                                    <button className="request__choice_button button_decline">
                                        <FontAwesomeIcon icon={faCircleXmark} />  Decline
                                    </button>
                                </div>
                            </div> )
                        })
                    }
                </div>
            </main>
        );
};

export default Main;