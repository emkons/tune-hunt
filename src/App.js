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
import { FirebaseProvider } from './context/FirebaseContext'
import Search from './pages/Search';
import useSettings from './hooks/useSettings';
import DailyStats from './pages/DailyStats';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [volume, setVolume] = useSettings('volume', 50)
  const [darkMode] = useSettings('darkMode', () => window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col dark:bg-gray-700">
        <BrowserRouter>
          <FirebaseProvider>
            <FavouritesProvider>
              <SpotifyProvider>
                <Header volume={volume} setVolume={setVolume}></Header>
                <Routes>
                  <Route path='/'>
                    <Route index element={<Login />} />
                    <Route path='stats' element={<DailyStats />} />
                    {/* <Route path='search' element={<Search />} /> */}
                    <Route path="playlist">
                      <Route index element={<PlaylistSelect />} />
                      <Route path=":playlistId" element={<Game volume={volume} />} />
                    </Route>
                  </Route>
                </Routes>
                <Footer></Footer>
                <ToastContainer theme='dark' />
              </SpotifyProvider>
            </FavouritesProvider>
          </FirebaseProvider>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
