import { useEffect, useState } from "react";
import { useAuth } from "../routes/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  getDoc,
  doc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// Status values used across the app
const statusOptionsAll = ["All", "Yet to Look", "In Progress", "Resolved", "Spam"];
const statusOptionsActive = ["All", "Yet to Look", "In Progress"];
const statusOptionsRegion = ["All", "Your Region"];
// New: Type options
const typeOptions = ["All", "Deforestation", "Poaching", "Fire", "Illegal Land Encroachment", "Littering"];

export default function Complaints() {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filteredStatusActiveComplaints, setFilteredStatusActiveComplaints] = useState("All");
  const [filteredStatusAllComplaints, setFilteredStatusAllComplaints] = useState("All");
  const [filteredStatusAllRegionComplaints, setFilteredStatusAllRegionComplaints] = useState("All");
  const [filteredStatusMyComplaints, setFilteredStatusMyComplaints] = useState("All");

  // New: State variables for type filters in each section
  const [filteredTypeActiveComplaints, setFilteredTypeActiveComplaints] = useState("All");
  const [filteredTypeMyComplaints, setFilteredTypeMyComplaints] = useState("All");
  const [filteredTypeAllComplaints, setFilteredTypeAllComplaints] = useState("All");


  const [role, setRole] = useState(null); // "authority" | "citizen"
  const navigate = useNavigate();
  const [userRegion, setUserRegion] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ────────────────────────────────────────────────
  // Realtime complaints list
  // ────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "complaints"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComplaints(list);
      },
      (error) => {
        console.error("Error fetching complaints: ", error);
      }
    );
    return () => unsub();
  }, []);

  // ────────────────────────────────────────────────
  // Get current user's role (authority vs citizen) and region
  // ────────────────────────────────────────────────
  useEffect(() => {
    const fetchUserRoleAndRegion = async () => {
      setIsLoadingUser(true);
      if (!currentUser) {
        setRole(null);
        setUserRegion('');
        setIsLoadingUser(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role);
          setUserRegion(userSnap.data().region);
        } else {
          console.warn("User document not found for uid:", currentUser.uid);
          setRole(null);
          setUserRegion('');
        }
      } catch (err) {
        console.error("Failed to get user role or region", err);
        setRole(null);
        setUserRegion('');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserRoleAndRegion();
  }, [currentUser]);

  const getComplaintImageUrl = (type) => {
    switch (type) {
      case 'Deforestation':
        return '/images/deforestation.jpg';
      // This is your current image
      case 'Poaching':
        return '/images/poaching.jpg'; // Could be a local image
      // Example for another type (replace with your actual image URLs)
      case 'Fire':
        return '/images/fire.jpg';
      // Add more cases for other c.type values
      case 'Illegal Land Encroachment':
        return '/images/encroachment.jpg';

      default:
        return '/images/littering.jpg';
    }
  };

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Yet to Look':
      return 'bg-gray-600 text-white';
    case 'In Progress':
      return 'bg-blue-500 text-white';
    case 'Resolved':
      return 'bg-green-600 text-white';
    case 'Spam':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

  // Helper function to apply type filter
  const applyTypeFilter = (complaintsList, selectedType) => {
    if (selectedType === "All") {
      return complaintsList;
    }
    return complaintsList.filter(c => c.type === selectedType);
  };


  // Active Complaints (Authority's view, restricted to their region)
  let activeComplaintsBase = complaints.filter((c) => {
    const isInProgressOrYetToLook = ['Yet to Look', 'In Progress'].includes(c.status);
    const isMatchingRegion = c.region === userRegion;
    const isMatchingStatus = filteredStatusActiveComplaints === "All" || c.status === filteredStatusActiveComplaints;
    return isInProgressOrYetToLook && isMatchingRegion && isMatchingStatus;
  });
  const filteredActiveComplaints = applyTypeFilter(activeComplaintsBase, filteredTypeActiveComplaints);


  // My Complaints (Citizen's view, only for their submitted complaints)
  let myComplaintsBase = currentUser
    ? complaints.filter((c) => {
      const isMyComplaint = c.useruid === currentUser.uid;
      const isMatchingStatus = filteredStatusMyComplaints === "All" || c.status === filteredStatusMyComplaints;
      return isMyComplaint && isMatchingStatus;
    })
    : [];
  const filteredMyComplaints = applyTypeFilter(myComplaintsBase, filteredTypeMyComplaints);


  // All Complaints (Authority's comprehensive view, with region and status filter options)
  let allComplaintsBase = complaints.filter((c) => {
    const isMatchingRegion = filteredStatusAllRegionComplaints === "All" || c.region === userRegion;
    const isMatchingStatus = filteredStatusAllComplaints === "All" || c.status === filteredStatusAllComplaints;
    return isMatchingRegion && isMatchingStatus;
  });
  const filteredAllComplaints = applyTypeFilter(allComplaintsBase, filteredTypeAllComplaints);


  // ────────────────────────────────────────────────
  // Render Logic
  // ────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="bg-[url('/images/dark_background.jpg')] bg-fixed min-h-screen text-white">
        <div className=" md:max-w-[90vw] lg:max-w-[80vw] mx-auto pb-20 p-6">

          {/* Active Complaints Section */}
          <h1 className="text-4xl font-bold mb-8  text-center ">Active Complaints</h1>
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex gap-4 items-center">
              <label className="font-medium">Filter by Status:</label>
              <select
                value={filteredStatusActiveComplaints}
                onChange={(e) => setFilteredStatusActiveComplaints(e.target.value)}
                className="border px-3 py-2 rounded bg-black"
              >
                {statusOptionsActive.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 items-center">
              <label className="font-medium ml-4 sm:ml-0">Filter by Type:</label>
              <select
                value={filteredTypeActiveComplaints}
                onChange={(e) => setFilteredTypeActiveComplaints(e.target.value)}
                className="border px-3 py-2 rounded bg-black"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {isLoadingUser ? (
            <p className="text-white text-lg text-center">Loading active complaints...</p>
          ) : (
            filteredActiveComplaints.length === 0 ? (
              <p className="text-white text-lg text-center">No Active Complaints in your region.</p>
            ) : (
              <div className="h-88 flex gap-[25px] overflow-x-scroll">
                {filteredActiveComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="relative border rounded-md shadow-sm bg-cover bg-bottom cursor-pointer w-60 h-80 flex-shrink-0"
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    style={{ backgroundImage: `url('${getComplaintImageUrl(c.type)}')` }}
                  >
                    <div className="flex justify-end items-right">
                        <span className={`mt-1.5 mr-1.5 text-sm bg-[rgba(0,0,0,0.4)] px-3 py-1 rounded z-40 ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center items-center h-[50%] relative">
                      <p className="font-semibold text-center text-xl mb-5.5 bg-[rgba(0,0,0,0.4)] w-[100%] py-2.5 z-40">{c.type}</p>
                    </div>
                    <div className="text-center h-[35%] overflow-hidden">
                      <p className="font-semibold text-sm px-1.5">{c.address}</p>
                    </div>
                    <div className="absolute inset-0 rounded-md w-60 h-80 hover:bg-[rgba(0,0,0,0.4)]"></div>
                  </div>
                ))}
              </div>
            )
          )}


          {/* My Complaints Section (Conditional for Citizen) */}
          {isLoadingUser ? (
            <p className="text-white text-lg text-center">Loading user role...</p>
          ) : role === "citizen" && (
            <>
              <h1 className="text-4xl font-bold mb-8 mt-14 text-center ">My Complaints</h1>
              <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex gap-4 items-center">
                <label className="font-medium">Filter by Status:</label>
                <select
                  value={filteredStatusMyComplaints}
                  onChange={(e) => setFilteredStatusMyComplaints(e.target.value)}
                  className="border px-3 py-2 rounded bg-black"
                >
                  {statusOptionsAll.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                </div>
                {/* New: Filter by Type for My Complaints */}
                <div className="flex gap-4 items-center">
                <label className="font-medium ml-4 sm:ml-0">Filter by Type:</label>
                <select
                  value={filteredTypeMyComplaints}
                  onChange={(e) => setFilteredTypeMyComplaints(e.target.value)}
                  className="border px-3 py-2 rounded bg-black"
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                </div>
              </div>
              {filteredMyComplaints.length === 0 ? (
                <p className="text-white text-lg text-center">No Complaints filed by you.</p>
              ) : (
                <div className="h-88 flex gap-[25px] overflow-x-scroll">
                  {filteredMyComplaints.map((c) => (
                    <div
                      key={c.id}
                      className="relative border rounded-md shadow-sm bg-cover bg-bottom cursor-pointer w-60 h-80 flex-shrink-0"
                      onClick={() => navigate(`/complaints/${c.id}`)}
                      style={{ backgroundImage: `url('${getComplaintImageUrl(c.type)}')` }}
                    >
                      <div className="flex justify-end items-right">
                          <span className={`mt-1.5 mr-1.5 text-sm bg-[rgba(0,0,0,0.4)] px-3 py-1 rounded z-40 ${getStatusBadgeClass(c.status)}`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center items-center h-[50%] relative">
                        <p className="font-semibold text-center text-xl mb-5.5 bg-[rgba(0,0,0,0.4)] w-[100%] py-2.5 z-40">{c.type}</p>
                      </div>
                      <div className="text-center h-[35%] overflow-hidden">
                        <p className="font-semibold text-sm px-1.5">{c.address}</p>
                      </div>
                      <div className="absolute inset-0 rounded-md w-60 h-80 hover:bg-[rgba(0,0,0,0.4)]"></div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}


          {/* All Complaints Section */}
          <h1 className="text-4xl font-bold mb-8 mt-14 text-center ">All Complaints</h1>
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex gap-4 items-center">
            <label className="font-medium">Filter by Region:</label>
            <select
              value={filteredStatusAllRegionComplaints}
              onChange={(e) => setFilteredStatusAllRegionComplaints(e.target.value)}
              className="border px-3 py-2 rounded bg-black"
            >
              {statusOptionsRegion.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
              </div>
              <div className="flex gap-4 items-center">
            <label className="font-medium ml-4 sm:ml-0">Filter by Status:</label>
            <select
              value={filteredStatusAllComplaints}
              onChange={(e) => setFilteredStatusAllComplaints(e.target.value)}
              className="border px-3 py-2 rounded bg-black"
            >
              {statusOptionsAll.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            </div>
            {/* New: Filter by Type for All Complaints */}
            <div className="flex gap-4 items-center">
            <label className="font-medium ml-4 sm:ml-0">Filter by Type:</label>
            <select
              value={filteredTypeAllComplaints}
              onChange={(e) => setFilteredTypeAllComplaints(e.target.value)}
              className="border px-3 py-2 rounded bg-black"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            </div>
          </div>

          {filteredAllComplaints.length === 0 ? (
            <p className="text-white text-lg text-center">No complaints to display.</p>
          ) : (
            <div className="h-88 flex gap-[25px] overflow-x-scroll">
              {filteredAllComplaints.map((c) => (
                <div
                  key={c.id}
                  className="relative border rounded-md shadow-sm bg-cover bg-bottom cursor-pointer w-60 h-80 flex-shrink-0"
                  onClick={() => navigate(`/complaints/${c.id}`)}
                  style={{ backgroundImage: `url('${getComplaintImageUrl(c.type)}')` }}
                >

                  <div className="flex justify-end items-right">
                      <span className={`mt-1.5 mr-1.5 text-sm bg-[rgba(0,0,0,0.4)] px-3 py-1 rounded z-40 ${getStatusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center items-center h-[50%] relative">
                    <p className="font-semibold text-center text-xl mb-5.5 bg-[rgba(0,0,0,0.4)] w-[100%] py-2.5 z-40">{c.type}</p>
                  </div>
                  <div className="text-center h-[35%] overflow-hidden">
                    <p className="font-semibold text-sm px-1.5">{c.address}</p>
                  </div>
                  <div className="absolute inset-0 rounded-md w-60 h-80 hover:bg-[rgba(0,0,0,0.4)]"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}