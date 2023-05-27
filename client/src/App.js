import './App.css';
import Header from './components/header/Header'
import Main from './components/main/Main'
import Footer from './components/footer/Footer'
import {useState} from "react";

function App() {

    const [inGame, setInGame] = useState(false);

    const logInGameHandler = () => {
        setInGame((prevState) => !prevState)
    }

    return (
        <div className="App">
        <Header title={'Title'}>

        </Header>

        <Main text={'Title'} inGame={inGame} logInGameHandler={logInGameHandler}>

        </Main>
        <Footer text={'Title'}>
        </Footer>
    </div>
    );
}

export default App;
