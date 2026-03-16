import { useState } from "react"
import { FaHome, FaSearch, FaEnvelope, FaBell, FaUser } from "react-icons/fa"

const Navbar = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        ...styles.sidebar,
        width: expanded ? "200px" : "70px"
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <h2 style={styles.logo}>
        {expanded ? "Iris" : "Iris"}
      </h2>

      <NavItem icon={<FaHome />} label="Home" expanded={expanded} />
      <NavItem icon={<FaSearch />} label="Search" expanded={expanded} />
      <NavItem icon={<FaEnvelope />} label="Messages" expanded={expanded} />
      <NavItem icon={<FaBell />} label="Notifications" expanded={expanded} />
      <NavItem icon={<FaUser />} label="Profile" expanded={expanded} />

    </div>
  )
}

const NavItem = ({ icon, label, expanded }) => {
  return (
    <div style={styles.navItem}>
      <div style={styles.icon}>{icon}</div>
      {expanded && <span>{label}</span>}
    </div>
  )
}

const styles = {
  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    background: "#000",
    borderRight: "1px solid #222",
    padding: "20px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    transition: "width 0.2s ease"
  },

  logo: {
    marginBottom: "30px"
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    cursor: "pointer",
    fontSize: "16px"
  },

  icon: {
    fontSize: "20px",
    width: "25px"
  }
}

export default Navbar