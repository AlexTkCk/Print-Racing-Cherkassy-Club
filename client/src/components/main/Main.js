import React, {useState} from 'react';
import randomWords from 'random-words';
import './Main.css'

const rndText = randomWords(100).join(' ');

const Main = ({inGame, logInGameHandler}) => {

    const [usersInput, setUsersInput] = useState('');

    return inGame ?
        (
            <main className={'main'}>
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