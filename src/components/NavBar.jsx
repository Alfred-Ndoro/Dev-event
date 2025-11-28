import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <header>
      <nav>
        <Link to="/" className="logo">
          <img src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>Dev-Event Hub</p>
        </Link>

        <ul>
          <Link to="/home">Home</Link>

          <a href="#allEvents">Events</a>

          {/* Updated link to point to the new page */}
          <Link to="/bookings">My Bookings</Link>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
