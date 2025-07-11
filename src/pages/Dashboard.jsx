import { useEffect, useState } from "react";
import { useAuth } from "../routes/AuthContext";
import { db } from "../firebase/config"; // Removed 'storage' import
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// Define the complaint types for the dropdown
const complaintTypes = [
  "Deforestation",
  "Poaching",
  "Fire",
  "Illegal Land Encroachment",
  "Littering",
];

// Define type-specific questions
const typeSpecificQuestions = {
  "Deforestation": [
    { id: "areaAffectedInSqMtrs", question: "Estimated area affected (in sq. meters):", type: "number" },
    { id: "treesCut", question: "Approximate number of trees cut:", type: "number" },
    { id: "suspects", question: "Suspected party involved/Vehicle number(if known):", type: "textarea" }
  ],
  "Poaching": [
    { id: "animalType", question: "Type of animal suspected to be poached:", type: "text" },
    { id: "poachingMethod", question: "Suspected poaching method:", type: "textarea" },
    { id: "peopleStrength", question: "Approx number of people involved:", type: "number" }
  ],
  "Fire": [
    { id: "fireSize", question: "Estimated size of the fire:", type: "text" },
    { id: "cause", question: "Suspected cause of the fire:", type: "textarea" },
    { id: "injuries", question: "Were there any injuries or fatalities?", type: "radio", options: ["Yes", "No"] }
  ],
  "Illegal Land Encroachment": [
    { id: "landAreaInSq", question: "Estimated land area encroached (in sq. meters):", type: "number" },
    { id: "structures", question: "Are there any illegal structures built?", type: "radio", options: ["Yes", "No"] },
    { id: "suspects", question: "Suspected party involved (if known):", type: "text" }
  ],
  "Littering": [
    { id: "litterType", question: "Main type of litter observed (e.g., plastic, construction waste):", type: "text" },
    { id: "litterVolume", question: "Estimated volume/amount of litter:", type: "textarea" },
    { id: "frequency", question: "How often does this littering occur?", type: "text" }
  ]
};


export default function Dashboard() {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [region, setRegion] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [revealIdentity, setRevealIdentity] = useState(false);
  const [userContact, setUserContact] = useState({ email: "", phone: "" });
  const [userName, setUserName] = useState("")
  const [specificAnswers, setSpecificAnswers] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoleAndRegionAndContact = async () => {
      setIsLoadingUser(true);
      if (!currentUser) {
        setRole(null);
        setRegion("");
        setUserContact({ email: "", phone: "" });
        setIsLoadingUser(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setRole(userData.role);
          setRegion(userData.region);
          setUserName(userData.name);
          setUserContact({
            email: currentUser.email || "",
            phone: userData.phone || ""
          });

          if (!type && complaintTypes.length > 0) {
            setType(complaintTypes[0]);
          }
        } else {
          console.warn("User document not found for uid:", currentUser.uid);
          setRole(null);
          setRegion("");
          setUserContact({ email: currentUser.email || "", phone: "" });
        }
      } catch (err) {
        console.error("Failed to get user data", err);
        setRole(null);
        setRegion("");
        setUserContact({ email: currentUser.email || "", phone: "" });
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchRoleAndRegionAndContact();
  }, [currentUser, type]);

  const handleSpecificAnswerChange = (questionId, value) => {
    setSpecificAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!type) {
      alert("Please select a complaint type.");
      setSubmitting(false);
      return;
    }
    if (address.trim() === "") {
      alert("Please provide the address where the incident occurred.");
      setSubmitting(false);
      return;
    }

    let contactInfo = {};
    if (revealIdentity) {
      contactInfo = {
        complainantEmail: userContact.email,
        complainantPhone: userContact.phone
      };
    }

    try {
      await addDoc(collection(db, "complaints"), {
        useruid: currentUser.uid,
        type,
        description: description.trim(),
        address: address.trim(),
        status: "Yet to Look",
        region: region,
        ...contactInfo,
        specificQuestions: specificAnswers,
        createdAt: serverTimestamp(),
      });
      setType(complaintTypes[0] || "");
      setDescription("");
      setAddress("");
      setShowForm(false);
      setRevealIdentity(false);
      setSpecificAnswers({});
      alert("Complaint submitted successfully!");
    } catch (err) {
      console.error("Error adding complaint", err);
      alert("Failed to submit complaint. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <Navbar />
      {/* <div className="min-h-screen w-full bg-gradient-to-br from-[rgba(0,50,0,1)] via-[rgba(0,20,0,1)] to-[rgba(0,10,0,1)]"> */}
      <div className="min-h-screen bg-[url('/images/dark_background.jpg')] pt-10 opacity-100 bg-fixed">

        <div className="min-h-screen w-full bg-[rgba(0,0,0,0)]">

          <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-5xl font-bold mb-6 text-white text-center">
              Welcome, {userName}!
            </h1>

            <h2 className="text-2xl font-bold mb-6 text-white text-center">
              Together, let us dedicate ourselves to safeguarding our irreplaceable forests and magnificent wildlife. Our Earth calls for us, united, to rise and fiercely protect her vital forests and cherished wildlife, allowing the rich, verdant splendor of nature to flourish again across our world.
            </h2>

            {isLoadingUser ? (
              <p className="text-white text-center text-xl">Loading user data...</p>
            ) : (
              <>
                {role === "citizen" && (
                  <div className="mb-8 p-6 flex flex-col items-center">
                    <h2 className="text-2xl font-semibold mb-4 text-white text-center">
                      Witnessed something that's worth complaining? Do not hesitate to report
                    </h2>
                    <button
                      onClick={() => setShowForm(!showForm)}
                      className="max-w-md px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700  focus:ring-2 focus:ring-indigo-500 hover:cursor-pointer"
                    >
                      {showForm ? "Hide Form" : "File a Complaint"}
                    </button>

                    {showForm && (
                      <form onSubmit={handleSubmitComplaint} className="p-8 mt-6 space-y-4 bg-black border-2 border-white rounded-2xl">
                        <div>
                          <label htmlFor="complaintType" className="block text-white text-sm font-bold mb-2">
                            Complaint Type:
                          </label>
                          <select
                            id="complaintType"
                            value={type}
                            onChange={(e) => {
                              setType(e.target.value);
                              setSpecificAnswers({});
                            }}
                            className="text-white border px-3 py-2 rounded bg-black border-gray-500 focus:outline-none focus:shadow-outline focus:border-white"
                            required
                          >
                            {complaintTypes.map((compType) => (
                              <option key={compType} value={compType}>
                                {compType}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-white text-sm font-bold mb-2">
                            Description (Optional):
                          </label>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your complaint in more detail..."
                            rows="4"
                            className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-white resize-y"
                          ></textarea>
                        </div>

                        <div>
                          <label htmlFor="address" className="block text-white text-sm font-bold mb-2">
                            Address of Incident <span className="text-red-500">*</span>:
                          </label>
                          <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter the address or specific location of the incident..."
                            rows="3"
                            className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-white resize-y"
                            required
                          ></textarea>
                        </div>

                        {type && typeSpecificQuestions[type] && (
                          <div className="p-4 rounded-md mt-4">
                            <h3 className="text-lg text-white font-semibold mb-3">Additional Details for {type} (Optional):</h3>
                            {typeSpecificQuestions[type].map((q) => (
                              <div key={q.id} className="mb-3">
                                <label htmlFor={q.id} className="block text-white text-sm font-bold mb-1">
                                  {q.question}
                                </label>
                                {q.type === "text" && (
                                  <input
                                    type="text"
                                    id={q.id}
                                    value={specificAnswers[q.id] || ""}
                                    onChange={(e) => handleSpecificAnswerChange(q.id, e.target.value)}
                                    className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-white resize-y"
                                  />
                                )}
                                {q.type === "number" && (
                                  <input
                                    type="number"
                                    id={q.id}
                                    value={specificAnswers[q.id] || ""}
                                    onChange={(e) => handleSpecificAnswerChange(q.id, e.target.value)}
                                    className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-white resize-y"

                                  />
                                )}
                                {q.type === "textarea" && (
                                  <textarea
                                    id={q.id}
                                    value={specificAnswers[q.id] || ""}
                                    onChange={(e) => handleSpecificAnswerChange(q.id, e.target.value)}
                                    rows="2"
                                    className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-white resize-y"
                                  ></textarea>
                                )}
                                {q.type === "radio" && (
                                  <div className="flex items-center space-x-4">
                                    {q.options.map(option => (
                                      <label key={option} className="inline-flex items-center">
                                        <input
                                          type="radio"
                                          name={q.id}
                                          value={option}
                                          checked={specificAnswers[q.id] === option}
                                          onChange={(e) => handleSpecificAnswerChange(q.id, e.target.value)}
                                          className="form-radio text-indigo-600"
                                        />
                                        <span className="ml-2 text-white">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center mt-4">
                          <input
                            type="checkbox"
                            id="revealIdentity"
                            checked={revealIdentity}
                            onChange={(e) => setRevealIdentity(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                          />
                          <label htmlFor="revealIdentity" className="ml-2 block text-sm text-white">
                            Reveal my identity (Email: {userContact.email || 'N/A'}, Phone: {userContact.phone || 'N/A'})
                          </label>
                        </div>
                        <div className="flex justify-center items-center">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? "Submitting..." : "Submit Complaint"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className="text-white p-6 rounded-lg text-center">
                  <h2 className="text-2xl font-semibold mb-4 text-white text-center">
                    Have a look into what's happening to the forests around the country
                  </h2>
                  {currentUser ? (
                    <>
                      {/* <p className="text-lg">
                        You are logged in as:{" "}
                        <span className="font-semibold">{currentUser.email}</span>
                      </p> */}
                      {/* <p className="text-lg ">
                        Your role: <span className="font-semibold">{role || "Not set"}</span>
                      </p>
                      {role === "authority" && (
                        <p className="text-lg ">
                          Your region: <span className="font-semibold">{region || "Not set"}</span>
                        </p>
                      )} */}
                    </>
                  ) : (
                    <p className="text-gray-600">
                      Please log in to see your dashboard content.
                    </p>
                  )}

                  <button
                    onClick={() => navigate("/complaints")}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:cursor-pointer"
                  >
                    View All Complaints
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}