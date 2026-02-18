import Navbar from "./Navbar";
import SignInProfile from "./SignInProfile";
import "../styles/Header.css";
function header() {
  return (
    <div className="header-container">
      <Navbar />
      <SignInProfile />

    </div>
  );
}

export default header;
