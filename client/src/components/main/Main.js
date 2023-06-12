import React, {useEffect, useState, useRef} from 'react';
import './Main.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck} from '@fortawesome/free-solid-svg-icons'
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons'
import {faCarSide} from '@fortawesome/free-solid-svg-icons'
import {faCopy} from '@fortawesome/free-solid-svg-icons'
import {faCrown} from '@fortawesome/free-solid-svg-icons'
import {faFlagCheckered} from '@fortawesome/free-solid-svg-icons'
import {CopyToClipboard} from "react-copy-to-clipboard/src";

import {socket, currentUserId} from '../../socket'

const Main = () => {
    const [popUpVisible, setPopUpVisible] = useState('');
    const [popUpText, setPopUpText] = useState('');
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
    const randomTextRef = useRef(null);
    const userInputRef = useRef(null);
    const [winPopUpVisibility, setWinPopUpVisibility] = useState('hidden');
    const [scores, setScores] = useState({'client_1_score': 0, 'client_2_score': 0});

    const logInGameHandler = (e) => {
        socket.emit('connect_to_client', {
            connectID: e.target.value,
        })
    }

    useEffect(() => {
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


            if (parseInt(car1Ref.current.style.paddingLeft) > 2)
                car1Ref.current.style.paddingLeft = `${parseInt(car1Ref.current.style.paddingLeft) - 1}%`;
            if (parseInt(car2Ref.current.style.paddingLeft) > 10)
                car2Ref.current.style.paddingLeft = `${parseInt(car2Ref.current.style.paddingLeft) - 1}%`;

        })

        socket.on('key_valid', data => {
            setScores(prevState => {
                return {
                    client_1_score: prevState['client_1_score'] + data['client_1_score'],
                    client_2_score: prevState['client_2_score'] + data['client_2_score'],
                }
            })
            if (data['id'] === currentUserId) {
                setUsersInput(prevState => {
                    return [...prevState, {key: data.key, class: 'key_valid'}]
                })
                if (parseInt(car1Ref.current.style.paddingLeft) < 90)
                    car1Ref.current.style.paddingLeft = `${parseInt(car1Ref.current.style.paddingLeft) + 2}%`;
                randomTextRef.current.style.left = `${parseInt(randomTextRef.current.style.left)-35}px`
                userInputRef.current.style.left = `${parseInt(userInputRef.current.style.left)-35}px`
            }
            else
            if (parseInt(car2Ref.current.style.paddingLeft) < 90)
                car2Ref.current.style.paddingLeft = `${parseInt(car2Ref.current.style.paddingLeft) + 2}%`;

        })

        socket.on('key_wrong', data => {
            if (data['id'] === currentUserId) {
                setUsersInput(prevState => {
                    return [...prevState, {key: data.key, class: 'key_wrong'}]
                })
                randomTextRef.current.style.left = `${parseInt(randomTextRef.current.style.left)-35}px`
                userInputRef.current.style.left = `${parseInt(userInputRef.current.style.left)-35}px`
            }
        })

        socket.on('game_ended', data => {
            setWinPopUpVisibility('');
        })
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
                            <FontAwesomeIcon ref={car1Ref} style={{paddingLeft: '0px'}} className={'player_car'}
                                             icon={faCarSide}></FontAwesomeIcon>
                        </div>
                        <div className="player_screen">
                            <FontAwesomeIcon ref={car2Ref} style={{paddingLeft: '0px'}} className={'player_car'}
                                             icon={faCarSide}></FontAwesomeIcon>
                        </div>
                    </div>
                </div>
                <div className={`main__random_text_container ${inputActive}`}>
                    <div ref={randomTextRef} style={{left: '0px'}} className={"random_text"}>
                        {roomData.text.join(" ")}
                    </div>
                    <div ref={userInputRef} style={{left: '0px'}} className={`main__users_input_container`}>
                        {usersInput.map((char, index) => {
                            return <span key={index} className={char.class}>{char.key}</span>
                        })}
                    </div>
                    <textarea onBlur={() => setInputActive('')} onFocus={() => setInputActive('active')}
                              onKeyDown={handleUserInput} name="textarea"
                              className={'main__textarea_hidden'}></textarea>
                </div>
                <div className={`main__win_container ${winPopUpVisibility}`}>
                    <div className="main__win_overlay">

                    </div>
                    <div className="main__win_popup">
                        <h1 className={'win_popup__title'}>FINISH! <FontAwesomeIcon icon={faFlagCheckered}></FontAwesomeIcon> </h1>
                        <div className="scores_container">
                            <h2>{roomData['client_1']}: {scores['client_1_score']} points.</h2>
                            <h2>{roomData['client_2']}: {scores['client_2_score']} points.</h2>
                        </div>

                        <h1>Winner</h1>
                        <FontAwesomeIcon className={'win__icon'} icon={faCrown}></FontAwesomeIcon>
                        <h2>{scores['client_1_score'] > scores['client_2_score'] ?
                            roomData['client_1']
                            :
                            roomData['client_2']}</h2>

                        <button className={'win_popup__button'} onClick={() => {
                            setInGame(false);
                            setUsersInput([]);
                            setWinPopUpVisibility('hidden');
                            setScores({'client_1_score': 0, 'client_2_score': 0});
                        }}>Go to pit stop -></button>
                    </div>
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
                                        setGameRequests([]);
                                        setPopUpVisible('popUp_active');
                                        setPopUpText(
                                            <>
                                                <h1 className={'popup__title'}>Success!</h1>
                                                <h2 className={'popUp__subTitle'}>Connection might take few seconds.</h2>
                                            </>
                                        );
                                        setTimeout(() => {
                                            setPopUpVisible('');
                                        }, 2000);
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