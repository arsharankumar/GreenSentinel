import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-black">
      <nav className="bg-[rgba(0,0,0,1)] text-white px-6 py-5  flex justify-between items-center  ">
        <span className="text-xl font-bold">🌿 GreenSentinel</span>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 lg:gap-[20px] items-center justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className=" hover:bg-[rgba(0,250,0,0.8)] font-bold text-lg px-4 py-2 rounded-md hover:cursor-pointer">
            Dashboard
          </button>
          <button
            onClick={() => navigate("/profile")}
            className=" hover:bg-[rgba(0,250,0,0.8)] font-bold text-lg px-4 py-2 rounded-md hover:cursor-pointer">
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 font-bold text-lg px-4 py-2 rounded-md m-0 hover:cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-screen h-2 bg-[linear-gradient(to_top,rgba(0,30,0,0.8),rgba(0,150,0,0.6)_50%,rgba(0,250,0,0.8))]"></div>
    </div>
  );
}
