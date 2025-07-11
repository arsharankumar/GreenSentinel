// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../routes/AuthContext"; // assuming you have one
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        setProfileData(snap.data());
      }
    };
    fetchProfile();
  }, [currentUser]);

  if (!profileData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[url('/images/dark_background.jpg')] pt-10 opacity-100 bg-fixed">
          <div className="text-white text-lg text-center">Loading profile...</div>
        </div>
      </>
    );

  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[url('/images/dark_background.jpg')] pt-10 opacity-100 bg-fixed">
        <div className="max-w-2xl mx-auto p-6 text-white flex flex-col items-center">
          <h1 className="text-4xl text-center font-bold mb-8">Your Profile</h1>

          {profileData.role === "citizen" ? (
            <CitizenProfile profile={profileData} />
          ) : (
            <AuthorityProfile profile={profileData} />
          )}

          <div className="mt-14 text-center">
            {/* <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </button> */}
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 hover:cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CitizenProfile({ profile }) {
  return (
    <div className="text-xl flex flex-col gap-[25px]">
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phone}</p>
      <p><strong>Role:</strong> Citizen</p>
      <p><strong>Region:</strong> {profile.region}</p>
      <p><strong>State:</strong> {profile.state}</p>
      {/* Add more citizen-specific fields */}
    </div>
  );
}

function AuthorityProfile({ profile }) {
  return (
    <div className="text-xl flex flex-col gap-[25px]">
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> Authority</p>
      <p><strong>Phone:</strong> {profile.phone}</p>
      <p><strong>Region:</strong> {profile.region}</p>
      <p><strong>State:</strong> {profile.state}</p>
      {/* Add more authority-specific fields */}
    </div>
  );
}
