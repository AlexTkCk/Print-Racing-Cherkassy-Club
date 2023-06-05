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
    const [connectingTo, setConnectingTo] = useState('');

    const logInGameHandler = (e) => {
        socket.emit('connect_to_client', {
            connectID: e.target.value,
        })
    }

    useEffect(() => {
        socket.on('client_connected', (data) => {
            setCurrentUserId(data.client_id);
        })

        socket.on('connecting_successful', data => {
            setRoomData(data);
            setInGame(true);
            console.log(data)
        })

        socket.on('connecting_unsuccessful', () => {
            setPopUpVisible('popUp_active');
            setPopUpText(
                <>
                    <h1 className={'popup__title'}>Error !</h1>
                    <h2 className={'popUp__subTitle'}>User is not exist.</h2>
                </>
            );
            setTimeout(() => {
                setPopUpVisible('');
            }, 2000);
        })

        socket.on('new_game_request', data => {
            setGameRequests(prevState => [...prevState, data]);
            setConnectingTo(data['id']);
        })

        socket.on('timer_update', data => {
            setRoomData(prevState => {
                return {...prevState, timer: data}
            })
        })

        socket.on('key_valid', data => {
            setUsersInput(prevState => {
                return prevState + <span className={'key_valid'}>{data.key}</span>
            })
        })

        socket.on('key_wrong', data => {
            setUsersInput(prevState => {
                return prevState + <span className={'key_wrong'}>{data.key}</span>
            })
        })

        return socket.disconnect;
    }, [socket])

    const [usersInput, setUsersInput] = useState('');

    const handleUserInput = (e) => {
        socket.emit('check_text', {
            room: roomData['roomID'],
            key: e.key,
            text: roomData['text']
        })
    }

    return inGame ?
        (
            <main className={'main'}>
                <div className="main__car_display">
                    <h1 className="display__timer">{roomData['timer']}</h1>
                </div>
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

                <div className="requests_container">
                    {gameRequests.map((request, index)=> {
                            return (<div key={index} className={'request'}>
                                <h1 className={'request_title'}>{request.id} challenges you!</h1>
                                <div className="request__buttons_container">
                                    <button className="request__choice_button button_accept" onClick={
                                        () => {
                                            socket.emit('request_accepted', {
                                                connectID: connectingTo,
                                            })

                                        }
                                    }>
                                        <FontAwesomeIcon icon={faCheck} /> Accept</button>
                                    <button className="request__choice_button button_decline" onClick={
                                        () => {
                                            socket.emit('request_declined', {
                                                connectID: connectingTo,
                                            })
                                            setGameRequests(prevState => [...prevState.slice(0, index), ...prevState.slice(index+1)]);
                                        }
                                    }>
                                        <FontAwesomeIcon icon={faCircleXmark} />  Decline
                                    </button>
                                </div>
                            </div> )
                        })
                    }
                </div>
                <div className={`popUp ${popUpVisible}`}>
                    {popUpText}
                </div>
            </main>
        );
};

export default Main;