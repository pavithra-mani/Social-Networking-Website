import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Profile from "./components/profile/Profile";
import Chat from "./Chat";
import Navbar from "./components/Navbar";
import HomeFeed from "./pages/HomeFeed";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route
          path="/feed"
          element={
            <>
              <Navbar />
              <HomeFeed />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;