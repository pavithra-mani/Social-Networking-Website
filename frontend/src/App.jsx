import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import HomeFeed from "./pages/HomeFeed";
import Chat from "./pages/Chat";
//import Search from "./pages/Search";
import CreatePost from "./pages/CreatePost";

import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar /> {/* visible after login ideally */}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<HomeFeed />} />
        <Route path="/chat" element={<Chat />} />
        {/*<Route path="/search" element={<Search />} /> */}
        <Route path="/create" element={<CreatePost />} />
      </Routes>
    </Router>
  );
}

export default App;