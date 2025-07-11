import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../routes/AuthContext";
import Navbar from "../components/Navbar";

const statusOptions = ["Yet to Look", "In Progress", "Resolved", "Spam"];

export default function ComplaintDetails() {
  const { complaintId } = useParams();
  const { currentUser } = useAuth();

  const [complaintData, setComplaintData] = useState(null);
  const [complainantData, setComplainantData] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isSpammer, setIsSpammer] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState(true);

  // const [role, setRole] = useState(null);
  // const [currentUserRegion, setCurrentUserRegion] = useState(null);
  // NEW STATE: To store the complainant's *overall* contact info
  // const [complainantOverallEmail, setComplainantOverallEmail] = useState("");
  // const [complainantOverallPhone, setComplainantOverallPhone] = useState("");
  const [loading, setLoading] = useState(true);

  // ──────────────────────────────────────────────────────────────────
  // EFFECT HOOK: Fetches complaint, current user's role/region,
  // AND the complainant's overall spam status and general contact info.
  // ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // --- 1. FETCH COMPLAINT DETAILS ---
        const complaintSnap = await getDoc(doc(db, "complaints", complaintId));
        if (complaintSnap.exists()) {
          const complaintDetails = { id: complaintSnap.id, ...complaintSnap.data() };
          setComplaintData(complaintDetails); // Set the main complaint data

          // --- 2. FETCH COMPLAINANT'S USER DATA (using useruid from complaintDetails) ---
          const complainantUserRef = doc(db, "users", complaintDetails.useruid); // Use complaintDetails here
          const complainantUserSnap = await getDoc(complainantUserRef);
          if (complainantUserSnap.exists()) {
            const complainantUserDetails = complainantUserSnap.data();
            setComplainantData(complainantUserDetails); // Set the complainant's user data
            setIsSpammer((complainantUserDetails.spamComplaints?.length || 0) >= 3);
            // No need to set isSpammer, complainantOverallEmail, complainantOverallPhone here
            // They will be derived from complainantData directly where used.
          } else {
            setComplainantData(null); // Complainant user doc not found
          }
        } else {
          setComplaintData(null); // Complaint not found
          setComplainantData(null); // Also clear complainant data if complaint not found
        }

        // --- 3. FETCH CURRENT LOGGED-IN USER'S DATA ---
        if (currentUser) {
          const userSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (userSnap.exists()) {
            const currentLoggedInUserData = userSnap.data();
            setCurrentUserData(currentLoggedInUserData); // Set current user's data
            // No need to set role, currentUserRegion here. They will be derived.
          } else {
            setCurrentUserData(null); // Current user doc not found (shouldn't happen if onboarding works)
          }
        } else {
          setCurrentUserData(null); // No current user
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        // Ensure all states are reset on error
        setComplaintData(null);
        setComplainantData(null);
        setCurrentUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [complaintId, currentUser]); // Dependencies: re-run if complaint ID or logged-in user changes


  const role = currentUserData?.role;
  // const currentUserRegion = currentUserData?.region;

  // Overall spam status and contact info of the complainant
  // const isSpammer = (complainantData?.spamComplaints.length || 0) >= 3;
  // console.log('spam?', isSpammer);
  // const complainantOverallEmail = complainantData?.email || "";
  // const complainantOverallPhone = complainantData?.phone || "";

  // ──────────────────────────────────────────────────────────────────
  // HANDLER: Authority updates complaint status
  // ──────────────────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    // Basic checks: complaint must exist and status must actually be changing
    const oldStatus = complaintData.status;
    if (!complaintData || newStatus === oldStatus) return;

    const complaintRef = doc(db, "complaints", complaintData.id);
    const userRef = doc(db, "users", complaintData.useruid); // Reference to the complainant's user document


    try {
      // 1. Update the complaint's status in Firestore
      await updateDoc(complaintRef, { status: newStatus });

      // 2. Handle updating the complainant's overall spam count (only when marking as "Spam")
      // if (newStatus === "Spam" && complaintData.status !== "Spam") { // Check if status is changing TO "Spam"


      if (newStatus === "Spam") { // Check if status is changing TO "Spam"
        await updateDoc(userRef, {
          spamComplaints: arrayUnion(complaintData.id), // Add this complaint ID to their spam list
          // totalSpamComplaintsCount: increment(1)   // Atomically increment their total spam count
        });

        // OPTIONAL: Re-fetch complainant's user data to update `isSpammer` state immediately
        // for the current view, without needing a full page reload.
        const userSnapAfterUpdate = await getDoc(userRef);
        if (userSnapAfterUpdate.exists()) {
          setIsSpammer((userSnapAfterUpdate.data().spamComplaints.length || 0) >= 3);
          // Also update overall contact if needed (though it typically doesn't change)
          // setComplainantOverallEmail(userSnapAfterUpdate.data().email || "");
          // setComplainantOverallPhone(userSnapAfterUpdate.data().phone || "");
        }

      } else if (oldStatus === "Spam") {
        await updateDoc(userRef, {
          spamComplaints: arrayRemove(complaintData.id), // Add this complaint ID to their spam list
          // totalSpamComplaintsCount: increment(1)   // Atomically increment their total spam count
        });

        const userSnapAfterUpdate = await getDoc(userRef);
        if (userSnapAfterUpdate.exists()) {
          setIsSpammer((userSnapAfterUpdate.data().spamComplaints.length || 0) >= 3);
          // Also update overall contact if needed (though it typically doesn't change)
          // setComplainantOverallEmail(userSnapAfterUpdate.data().email || "");
          // setComplainantOverallPhone(userSnapAfterUpdate.data().phone || "");
        }
      }
      // NOTE ON DECREMENTING: If you want to decrement `totalSpamComplaintsCount`
      // when a complaint is moved *from* "Spam" to another status, that logic
      // is more complex. It typically involves using `arrayRemove` to remove the ID
      // from `spamComplaints` and then decrementing. For a hackathon, often
      // incrementing only is sufficient as "Spam" might be considered a final state.

      // 3. Update the local state to reflect the new status
      setComplaintData((prev) => ({ ...prev, status: newStatus }));
      alert("Complaint status updated successfully!"); // Give feedback to the user
    } catch (error) {
      console.error("Error updating complaint status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Helper function to format Firestore Timestamps into a readable date/time string
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate(); // Convert Firestore Timestamp to Date object
    return date.toLocaleString(); // Format as local date and time string
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


  if (loading) return (
    <>
      <Navbar />
      <div className="bg-[url('/images/dark_background.jpg')] pt-10 min-h-screen bg-fixed text-white mt-0 px-[15px]">
        <p className="p-4 text-center text-white-600 text-xl">Loading complaint details...</p>
      </div>
    </>
  );

  if (!complaintData) return (
    <>
      <Navbar />
      <div className="bg-[url('/images/dark_background.jpg')] pt-10 min-h-screen bg-fixed text-white mt-0 px-[15px]">
        <p className="p-4 text-center text-red-600">Complaint not found or an error occurred.</p>
      </div>
    </>
  );

  // ──────────────────────────────────────────────────────────────────
  // DECISION LOGIC FOR RENDERING
  // ──────────────────────────────────────────────────────────────────

  // Determines if the status dropdown should be editable (authority in correct region)
  const canEditStatus = role === "authority" && currentUserData.region === complaintData.region;

  // Determines if complainant contact info should be displayed
  // Condition 1: Current viewer is an authority AND complainant is a spammer (always reveal)
  // Condition 2: Current viewer is an authority AND complainant explicitly revealed for *this* complaint
  // Condition 3: Current viewer is the complainant themselves AND they explicitly revealed for *this* complaint
  const displayComplainantContact = (
    (role === "authority" && isSpammer) ||
    (role === "authority" && (complaintData.complainantEmail || complaintData.complainantPhone)) ||
    (currentUser?.uid === complaintData.useruid && (complaintData.complainantEmail || complaintData.complainantPhone))
  );

  // ──────────────────────────────────────────────────────────────────
  // COMPONENT RENDERING
  // ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="bg-[url('/images/dark_background.jpg')] pt-10 min-h-screen bg-fixed text-white mt-0 px-[15px]">
        <div className="max-w-xl mx-auto p-6 border rounded-lg shadow-md bg-[url('/images/dark_background.jpg')] pt-10 bg-right shadow-[rgba(0,250,0,0.8)] hover:scale-[1.01]">
          <div className="bg-[linear-gradient(to_top,rgba(0,0,0,0.1),rgba(0,0,0,0.3)_50%,rgba(0,0,0,0))]">
            <h2 className="text-3xl font-bold text-white text-center mb-[18px]">{complaintData.type}</h2>

            <div className="space-y-3 text-shadow-white">
              <p className="text-center mb-[45px]">
                <span className="font-semibold">Status:</span>{" "}
                {canEditStatus ? (
                  <select
                    value={complaintData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`border px-3 py-1 rounded-md ${getStatusBadgeClass(complaintData.status)}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Display as static text if not editable
                  <span className={`px-3 py-1 rounded-md text-base font-medium ${getStatusBadgeClass(complaintData.status)}`}>
                    {complaintData.status}
                  </span>
                )}
              </p>

              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="font-semibold">Filed On:</span>{" "}
                  {formatDate(complaintData.createdAt)}
                </li>
                <li>
                  <span className="font-semibold">Address of Incident:</span>{" "}
                  {complaintData.address || "N/A"}
                </li>
                <li>
                  <span className="font-semibold">Region:</span>{" "}
                  {complaintData.region || "N/A"}
                </li>
                <li>
                  <span className="font-semibold">State:</span>{" "}
                  {complainantData.state || "N/A"}
                </li>
                {complaintData.description && (
                  <li>
                    <span className="font-semibold">Description:</span>{" "}
                    {complaintData.description}
                  </li>
                )}
              </ul>

              {/* Display Specific Questions */}
              {complaintData.specificQuestions && Object.keys(complaintData.specificQuestions).length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-xl font-semibold mb-3 text-white text-center">Additional Details:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(complaintData.specificQuestions).map(([key, value]) => (
                      <li key={key} className="text-white">
                        <span className="font-semibold capitalize">
                          {/* Format camelCase keys to readable text (e.g., 'areaAffected' -> 'Area Affected') */}
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>{" "}
                        {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display Complainant Contact Info based on displayComplainantContact logic */}
              {displayComplainantContact && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-xl font-semibold mb-3 text-white text-center">Complainant Contact:</h3>
                  {/* If authority and spammer, show overall contact from user's profile */}
                  {role === "authority" && isSpammer ? (
                    <>
                      <ul className="list-disc list-inside space-y-1">
                        <p>
                          <span className="font-semibold">Email (Spammer):</span>{" "}
                          <a href={`mailto:${complainantData.email}`} className="text-red-600 hover:underline font-bold">
                            {complainantData.email || "N/A"}
                          </a>
                        </p>
                        <p>
                          <span className="font-semibold">Phone (Spammer):</span>{" "}
                          <a href={`tel:${complainantData.phone}`} className="text-red-600 hover:underline font-bold">
                            {complainantData.phone || "N/A"}
                          </a>
                        </p>
                      </ul>
                    </>
                  ) : ( // Otherwise, show only what was explicitly revealed for this specific complaint
                    <>
                      <ul className="list-disc list-inside space-y-1">
                        {complaintData.complainantEmail && (
                          <li>
                            <span className="font-semibold">Email:</span>{" "}
                            <a href={`mailto:${complaintData.complainantEmail}`} className="text-blue-600 hover:underline">
                              {complaintData.complainantEmail}
                            </a>
                          </li>
                        )}
                        {complaintData.complainantPhone && (
                          <li>
                            <span className="font-semibold">Phone:</span>{" "}
                            <a href={`tel:${complaintData.complainantPhone}`} className="text-blue-600 hover:underline">
                              {complaintData.complainantPhone}
                            </a>
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {/* Display Spammer Warning if applicable */}
              {isSpammer && (
                role === "authority" ? (
                  <div className="text-sm text-red-600 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="font-semibold">⚠️ Warning: This complainant has filed 3 or more complaints that have been marked as SPAM. Their contact information (Email & Phone) is revealed above for your review.</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="font-semibold">⚠️ Warning: This complainant has filed 3 or more complaints that have been marked as SPAM.</p>
                  </div>
                )
              )}

              {!displayComplainantContact && !isSpammer && (
                <div className="text-sm text-blue-700 mt-4 p-3 bg-blue-50 border border-blue-50 rounded-md">
                  <p className="font-semibold text-center">The complainant wishes to stay anonymous.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}