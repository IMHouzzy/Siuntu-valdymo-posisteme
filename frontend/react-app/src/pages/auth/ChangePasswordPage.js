import "../../styles/Auth.css";


function ChangePassword() {

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <h2>Slaptažodžio keitimas</h2>

                <form className="login-form">
                    <div className="form-group">
                        <input type="password" id="new-password" name="new-password" placeholder="Naujas slaptažodis" required />
                    </div>
                      <div className="form-group">
                        <input type="password" id="repeat-password" name="repeat-password" placeholder="Pakartokite slaptažodį" required />
                    </div>
                    <button type="submit" className="login-button">Keisti</button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;
