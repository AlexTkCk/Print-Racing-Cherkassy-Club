import './App.css';
import Header from './components/header/Header'
import Main from './components/main/Main'
import Footer from './components/footer/Footer'

function App() {
    return (
        <div className="App">
        <Header title={'Title'}>

        </Header>

        <Main text={'Title'}>

        </Main>
        <Footer text={'Title'}>
        </Footer>
    </div>
    );
}

export default App;
