import Navbar from "./components/Navbar"
import HomeFeed from "./pages/HomeFeed"

function App() {
  return (
    <div style={styles.app}>
      <Navbar />
      <HomeFeed />
    </div>
  )
}

const styles = {
  app: {
    backgroundColor: "#000",
    color: "white",
    minHeight: "100vh"
  }
}

export default App