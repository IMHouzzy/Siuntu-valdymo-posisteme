import { Outlet } from "react-router-dom";
import CourierHeader from "../components/CourierHeader";
import "../styles/CourierLayout.css";

export default function CourierLayout() {
  return (
    <div className="cr-layout">
      <CourierHeader />
      <main className="cr-content">
        <Outlet />
      </main>
    </div>
  );
}