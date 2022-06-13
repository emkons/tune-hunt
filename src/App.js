import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Content from './components/Content';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Login from './components/Login';
import PlaylistSelect from './components/PlaylistSelect';
import Game from './components/Game';
import { SpotifyProvider } from './context/SpotifyContext';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <SpotifyProvider>
          <Header></Header>
          <Routes>
            <Route path='/'>
              <Route index element={<Login />} />
              <Route path="playlist">
                <Route index element={<PlaylistSelect />}/>
                <Route path=":playlistId" element={<Game />} />
              </Route>
            </Route>
          </Routes>
          <Footer></Footer>
        </SpotifyProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
