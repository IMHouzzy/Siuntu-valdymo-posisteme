import Navbar from "./Navbar";
import SignInButtons from "./SignInButtons";
import "../styles/Header.css";
function header() {
  return (
    <div className="header-container">
    <Navbar/>
    <SignInButtons/>

    </div>
  );
}

export default header;
