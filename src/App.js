import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Login from './pages/Login';
import PlaylistSelect from './pages/PlaylistSelect';
import Game from './pages/Game';
import { SpotifyProvider } from './context/SpotifyContext';
import { FavouritesProvider } from './context/FavouritesContext';
import useLocalStorage from './hooks/useLocalStorage';
import Search from './pages/Search';

function App() {
  const [volume, setVolume] = useLocalStorage('volume', 50)

  return (
    <div className="h-screen flex flex-col">
      <BrowserRouter>
        <SpotifyProvider>
          <FavouritesProvider>
            <Header volume={volume} setVolume={setVolume}></Header>
            <Routes>
              <Route path='/'>
                <Route index element={<Login />} />
                <Route path='search' element={<Search />}/>
                <Route path="playlist">
                  <Route index element={<PlaylistSelect />}/>
                  <Route path=":playlistId" element={<Game volume={volume} />} />
                </Route>
              </Route>
            </Routes>
            <Footer></Footer>
          </FavouritesProvider>
        </SpotifyProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
