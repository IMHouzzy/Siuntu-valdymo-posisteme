import "../../styles/Auth.css";

function AccountConfirmationPassword() {
    return (
        <div className="login-container">
            <div className="login-wrapper">
                <h2>Slaptažodžio keitimas</h2>

                <form className="login-form">
                    <div className="form-group">
                        <input type="email" id="email" name="email" placeholder="El.paštas" required />
                    </div>
                        <span className="sub-text">*Įveskite paskyros el.paštą</span>
                    <button type="submit" className="login-button">Siųsti</button>
                </form>
            </div>
        </div>
    );
}

export default AccountConfirmationPassword;
