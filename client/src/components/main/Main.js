import React, {useEffect, useState, useRef} from 'react';
import './Main.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck} from '@fortawesome/free-solid-svg-icons'
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons'
import {faCarSide} from '@fortawesome/free-solid-svg-icons'
import {faCopy} from '@fortawesome/free-solid-svg-icons'
import {CopyToClipboard} from "react-copy-to-clipboard/src";

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
    const [usersInput, setUsersInput] = useState([]);
    const car1Ref = useRef(null);
    const car2Ref = useRef(null);
    const [clipBoardText, setClipBoardText] = useState('');


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
            car1Ref.current.style.paddingLeft = `${parseInt(car1Ref.current.style.paddingLeft) - 10}px`;
        })

        socket.on('key_valid', data => {
            setUsersInput(prevState => {
                return [...prevState, {key: data.key, class: 'key_valid'}]
            })
            car1Ref.current.style.paddingLeft = `${parseInt(car1Ref.current.style.paddingLeft) + 15}px`;
        })

        socket.on('key_wrong', data => {
            setUsersInput(prevState => {
                return [...prevState, {key: data.key, class: 'key_wrong'}]
            })
        })

        return socket.disconnect;
    }, [socket])

    const handleUserInput = (e) => {
        if (['Backspace',
            'Shift',
            'Alt',
            'Control',
            'Enter',
            'Tab',
            'Escape',
            'CapsLock'].includes(e.key)) {
            e.preventDefault();
            return
        }
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
                    <div className="split_screen_container">
                        <div className="player_screen">
                            <FontAwesomeIcon ref={car1Ref} style={{paddingLeft: '10px'}} className={'player_car'}
                                             icon={faCarSide}></FontAwesomeIcon>
                        </div>
                        <div className="player_screen">
                            <FontAwesomeIcon ref={car2Ref} style={{paddingLeft: '10px'}} className={'player_car'}
                                             icon={faCarSide}></FontAwesomeIcon>
                        </div>
                    </div>
                </div>
                <div className={`main__random_text_container ${inputActive}`}>
                    {roomData.text.join(" ")}
                    <div className={`main__users_input_container`}>
                        {usersInput.map((char, index) => {
                            return <span key={index} className={char.class}>{char.key}</span>
                        })}
                    </div>
                    <textarea onBlur={() => setInputActive('')} onFocus={() => setInputActive('active')}
                              onKeyDown={handleUserInput} name="textarea"
                              className={'main__textarea_hidden'}></textarea>
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
                    <div className="log_in__id_container">
                        <h2 className="log_in__subTitle">
                            {currentUserId}
                        </h2>
                        <CopyToClipboard text={clipBoardText}>
                            <FontAwesomeIcon className={'copy_to_clipboard__button'}
                                             onClick={() => {
                                                 setPopUpVisible('popUp_active');
                                                 setPopUpText(
                                                     <>
                                                         <h1 className={'popup__title'}>Success!</h1>
                                                         <h2 className={'popUp__subTitle'}>Your id was copied to clipboard.</h2>
                                                     </>
                                                 );
                                                 setTimeout(() => {
                                                     setPopUpVisible('');
                                                 }, 2000);
                                                 setClipBoardText(currentUserId);
                                             }}
                                             icon={faCopy}>Copy</FontAwesomeIcon>
                        </CopyToClipboard>
                    </div>
                    <input type="text" className="log_in__input" placeholder={'Input room ID'}
                           onChange={(e) => setConnectID(e.target.value)}/>

                    <button className="log_in__input_button" onClick={logInGameHandler} value={connectID}>Log in ->
                    </button>
                </div>

                <div className="requests_container">
                    {gameRequests.map((request, index) => {
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
                                    <FontAwesomeIcon icon={faCheck}/> Accept
                                </button>
                                <button className="request__choice_button button_decline" onClick={
                                    () => {
                                        socket.emit('request_declined', {
                                            connectID: connectingTo,
                                        })
                                        setGameRequests(prevState => [...prevState.slice(0, index), ...prevState.slice(index + 1)]);
                                    }
                                }>
                                    <FontAwesomeIcon icon={faCircleXmark}/> Decline
                                </button>
                            </div>
                        </div>)
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