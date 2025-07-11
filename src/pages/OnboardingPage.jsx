// src/pages/OnboardingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { reload } from 'firebase/auth'; // Ensure reload is imported

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Start loading to fetch profile
  const [profileStep, setProfileStep] = useState(0); // 0: loading, 1: role, 2: contact
  const [rolePicked, setRolePicked] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [stateName, setStateName] = useState("");
  const [regionName, setregionName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const isFormComplete = phone.trim() !== "" && stateName !== "" && regionName !== "";

  const stateregions = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
    "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Korba"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Kullu", "Mandi"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Manipur": ["Imphal", "Thoubal", "Churachandpur", "Bishnupur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
    "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Haldwani"],
    "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri"],

    // Union Territories
    "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Mayabunder", "Hut Bay"],
    "Chandigarh": ["Sector 17", "Manimajra", "Daria", "Industrial Area"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu", "Amli"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Karol Bagh"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    "Ladakh": ["Leh", "Kargil", "Diskit", "Nubra"],
    "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Amini"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  };

  const indianStates = Object.keys(stateregions);
  const regions = stateregions[stateName] || [];

  // (Include your stateregions, indianStates, and regions logic here)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!auth.currentUser) {
        navigate('/signup'); // No authenticated user, redirect to signup/login
        return;
      }

      try {
        setLoading(true);
        await reload(auth.currentUser); // Refresh user token/status

        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists() || !auth.currentUser.emailVerified) {
          // User document missing or email not verified.
          // This might happen if they somehow skipped signup flow, or a race condition.
          // Redirect them to signup or email verification page.
          console.log("User doc missing or email not verified. Redirecting.");
          navigate('/verify-email'); // Or a dedicated email verification page
          return;
        }

        const userData = userDocSnap.data();

        if (userData.onboardingComplete) {
          navigate('/dashboard'); // Onboarding already complete, go to profile
          return;
        }

        // Pre-fill state if data already exists (e.g., user refreshed)
        if (userData.role) {
          setRolePicked(userData.role);
        }
        if (userData.phone) {
          setPhone(userData.phone);
        }
        if (userData.state) {
          setStateName(userData.state);
        }
        if (userData.region) {
          setregionName(userData.region);
        }

        // Determine current step based on available data
        if (!userData.role) {
          setProfileStep(1); // Go to role selection
        } else if (!userData.phone || !userData.state || !userData.region) {
          setProfileStep(2); // Go to contact details
        } else {
          // Should theoretically not happen if onboardingComplete is false,
          // but if all data is there, just proceed to final step.
          setProfileStep(2); // Fallback: if role exists, assume contact details are next or pending
        }

      } catch (error) {
        console.error("Error loading onboarding data:", error);
        // Handle errors, maybe redirect to an error page or log out.
        navigate('/signup'); // Fallback to signup on critical error
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [auth.currentUser, navigate]); // Depend on auth.currentUser and navigate

  const handleSelectRoleAndProceed = (role) => {
    setRolePicked(role);
    setProfileStep(2);
  };

  const handleFinishOnboarding = async () => {
    if (!auth.currentUser) return; // Should not happen due to route protection
    setLoading(true);
    try {
      const userData = {
        name: name,
        role: rolePicked,
        phone: phone.trim(),
        state: stateName,
        region: regionName,
        onboardingComplete: true, // Mark onboarding as complete!
      };

      if (rolePicked === 'citizen') {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists() || userDocSnap.data().spamComplaints === undefined) {
          userData.spamComplaints = [];
        }
      }

      await setDoc(doc(db, "users", auth.currentUser.uid), userData, { merge: true });
      navigate("/dashboard"); // Redirect to main app
    } catch (err) {
      console.error("Error saving profile:", err);
      setStatusMessage("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/images/forest_waterfall.jpg')] bg-cover bg-right ">
      <div className='text-white flex flex-col md:flex-row items-center justify-center bg-[linear-gradient(to_top,rgba(0,0,0,0.8),rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.8))] min-h-screen w-screen p-2.5 md:p-8'>
        <div className="p-4 min-w-[60vw] md:min-w-xl md:max-w-5xl mx-auto flex flex-col items-center  ">
          {loading ? (
            <div className="flex space-x-2 justify-center items-center">
              <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:0ms]"></div>
              <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:150ms]"></div>
              <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:300ms]"></div>
            </div>
          ) : profileStep === 1 ? (
            <>
              <h2 className="text-4xl font-bold mb-4">Choose Your Role</h2>

              <button
                onClick={() => { setRolePicked("citizen"); setProfileStep(2); }}
                className="px-5 py-2 mb-4 w-[180px] bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer"
              >
                I’m a Citizen
              </button>

              <button
                onClick={() => { setRolePicked("authority"); setProfileStep(2); }}
                className="px-5 py-2 mb-4 w-[180px] bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 text-lg font-medium hover:cursor-pointer"
              >
                I’m an Authority
              </button>
            </>
          ) : profileStep === 2 ? (
            <>
              <h2 className="text-4xl font-bold mb-4">Almost done!</h2>
              <label className="text-xl block mb-1 font-semibold">Enter Name</label>
              <input
                type="tel"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-sm mb-8"
                required
              />

              <label className="text-xl block mb-1 font-semibold">Enter Phone Number</label>
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded-sm mb-8"
                required
              />

              <label className="text-xl block mb-1 font-semibold">Select State</label>
              <select
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full px-3 py-2 border rounded-sm mb-8 bg-black"
                // border px-3 py-2 rounded bg-black
              >
                <option value="">-- Select State --</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              <label className="text-xl block mb-1 font-semibold">Select Region</label>
              <select
                value={regionName}
                onChange={(e) => setregionName(e.target.value)}
                className="w-full px-3 py-2 border rounded-sm mb-8 bg-black"
              >
                <option value="">-- Select region --</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              <button
                onClick={handleFinishOnboarding}
                disabled={!isFormComplete}
                className={`w-full px-4 py-2 rounded transition ${name && phone && stateName && regionName
                  ? "px-5 py-2 mt-8 w-[180px] bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer"
                  : "px-5 py-2 mt-8 w-[180px] bg-gray-300 text-gray-500 rounded-md shadow-md text-lg font-medium cursor-not-allowed"
                  }`}
              >
                Create Profile
              </button>
            </>
          ) : (
            <div className="p-4 max-w-md mx-auto text-center">Something went wrong with onboarding. Please try again from the beginning.</div>
          )}
        </div>
      </div>
    </div>
  );



  if (loading) {
    return <div className="p-4 max-w-md mx-auto flex justify-center items-center">Loading onboarding...</div>;
  }

  // Render logic based on profileStep (similar to what was in Signup.jsx)
  if (profileStep === 1) {
    return (
      <div className="p-6 max-w-md mx-auto text-center border rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Choose Your Role</h2>

        <button
          onClick={() => { setRolePicked("citizen"); setProfileStep(2); }}
          className="mb-3 bg-green-600 hover:bg-green-700 text-white py-2 w-full rounded"
        >
          I’m a Citizen
        </button>

        <button
          onClick={() => { setRolePicked("authority"); setProfileStep(2); }}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 w-full rounded"
        >
          I’m an Authority
        </button>
      </div>
    );
  }

  if (profileStep === 2) {
    return (
      <div className="p-6 max-w-md mx-auto border rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Almost done!</h2>
        <label className="block mb-1 font-semibold">Enter Name</label>
        <input
          type="tel"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border mb-3"
          required
        />

        {name && (
          <div>
            <label className="block mb-1 font-semibold">Enter Phone Number</label>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border mb-3"
              required
            />
          </div>
        )}

        {phone && (
          <div>
            <label className="block mb-1 font-semibold">Select State</label>
            <select
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select State --</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        )}

        {stateName && (
          <div>
            <label className="block font-medium mb-1">region</label>
            <select
              value={regionName}
              onChange={(e) => setregionName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select region --</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleFinishOnboarding}
          disabled={!isFormComplete}
          className={`w-full px-4 py-2 rounded transition ${isFormComplete
            ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Create Profile
        </button>

      </div>
    );
  }

  // Fallback or initial state if somehow not caught by above steps
  return <div className="p-4 max-w-md mx-auto text-center">Something went wrong with onboarding. Please try again from the beginning.</div>;
}