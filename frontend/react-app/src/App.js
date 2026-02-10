import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UsersPage from "./pages/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AccountConfirmationPassword from "./pages/AccountConfirmationPassword";
import ChangePassword from "./pages/ChangePasswordPage";
import Header from "./components/header";
import OrderPage from "./pages/OrderPage";
import ProductPage from "./pages/ProductPage";


function App() {
  return (
    <>
      <Header/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account-confirmation" element={<AccountConfirmationPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/orderList" element={<OrderPage />} />
        <Route path="/productList" element={<ProductPage />} />
        <Route path="/usersList" element={<UsersPage />} />
        
      </Routes>
    </>
  );
}

export default App;
