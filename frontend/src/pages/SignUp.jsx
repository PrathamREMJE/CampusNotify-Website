import Login from "./Login";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  // const [showLogin, setShowLogin] = useState(false);

  const [collegeId, setCollegeId] = useState(null);
  const [collegeName, setCollegeName] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [collegePhno, setCollegePhno] = useState("");
  const [collegeAddr, setCollegeAddr] = useState("");
  const [programmes, setProgrammes] = useState({
    junior: false,
    ug: false,
    pg: false,
  });
  const [collegeDocument, setCollegeDocument] = useState(null);

  const [collegeErrors, setCollegeErrors] = useState({});
  const [principalErrors, setPrincipalErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [principalName, setPrincipalName] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalPhno, setPrincipalPhno] = useState("");
  const [principalUsername, setPrincipalUsername] = useState("");
  const [principalPassword, setPrincipalPassword] = useState("");
  const [principalConfirmPassword, setPrincipalConfirmPassword] = useState("");

  const handleFileChange = (e) => {
    setCollegeDocument(e.target.files[0]);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    let errors = {};

    if (!collegeName.trim()) errors.college_name = "College name is required.";
    if (!/^\d{6}$/.test(collegeCode)) {
      errors.college_code = "College code must be a 6-digit number.";
    }
    if (!/^\d{10}$/.test(collegePhno)) {
      errors.college_phno = "Enter a valid 10-digit phone number.";
    }
    if (
      !collegeEmail.trim() ||
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(collegeEmail)
    ) {
      errors.college_email = "Enter a valid email address.";
    }
    if (!collegeAddr.trim())
      errors.college_address = "College address is required.";

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!collegeDocument) {
      errors.college_documents = "Please upload a valid college document.";
    } else {
      if (!allowedTypes.includes(collegeDocument.type)) {
        errors.college_documents = "Only PDF, JPG, or PNG files are allowed.";
      }
      if (collegeDocument.size > 2 * 1024 * 1024) {
        errors.college_documents = "File size should not exceed 2MB.";
      }
    }

    if (!programmes.junior && !programmes.ug && !programmes.pg) {
      errors.programmes = "Select at least one programme.";
    }

    setCollegeErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append("college_name", collegeName);
    formData.append("college_code", collegeCode);
    formData.append("college_phno", collegePhno);
    formData.append("college_email", collegeEmail);
    formData.append("college_address", collegeAddr);
    formData.append("college_documents", collegeDocument);
    formData.append("offers_junior", programmes.junior);
    formData.append("offers_ug", programmes.ug);
    formData.append("offers_pg", programmes.pg);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/college/", {
        method: "POST",
        body: formData,
      });
    
      if (response.ok) {
        const data = await response.json();
        setCollegeId(data.id);
        setStep(2);
      } else {
        const error = await response.json();
        console.log("College error:", error);
    
        if (
          error.college_code?.[0]?.includes("already exists") ||
          error.college_email?.[0]?.includes("already exists")
        ) {
          setCollegeErrors({
            alreadyExistsMessage: (
              <p className="text-sm text-red-500 mt-3 text-center">
                This college is already registered. Please{" "}
                <span
                  className="text-blue-500 underline cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  login here
                </span>.
              </p>
            ),
          });
        } else {
          alert("College registration failed.");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Network error.");
    }
    
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};

    if (!principalName.trim())
      errors.college_admin_name = "College Admin name is required.";
    if (
      !principalEmail.trim() ||
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(principalEmail)
    ) {
      errors.college_admin_email = "Enter a valid email address.";
    }
    if (!/^\d{10}$/.test(principalPhno)) {
      errors.college_admin_phno = "Enter a valid 10-digit phone number.";
    }
    if (!principalUsername.trim()) {
      errors.college_admin_username = "Username is required.";
    } else if (principalUsername.length < 4) {
      errors.college_admin_username = "Username must be at least 4 characters.";
    }
    if (!principalPassword.trim()) {
      errors.college_admin_password = "Password is required.";
    } else if (principalPassword.length < 6) {
      errors.college_admin_password =
        "Password must be at least 6 characters.";
    }
    if (principalPassword !== principalConfirmPassword) {
      errors.college_admin_confirm_password = "Passwords do not match.";
    }

    setPrincipalErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append("college", collegeId);
    formData.append("college_admin_name", principalName);
    formData.append("college_admin_email", principalEmail);
    formData.append("college_admin_phno", principalPhno);
    formData.append("college_admin_username", principalUsername);
    formData.append("college_admin_password", principalPassword);
    formData.append(
      "college_admin_confirm_password",
      principalConfirmPassword
    );

    try {
      const response = await fetch("http://127.0.0.1:8000/api/college-admin/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("College Admin registered successfully! You can now log in.");
        setPrincipalErrors({});
        setTimeout(() => {
          navigate("/login"); // 👈 Auto switch to login form after success
        }, 1500);
      } else {
        const error = await response.json();
        console.error("Principal Error:", error);
        alert("Principal registration failed.");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Server not reachable.");
    }
  };


    return (
      <>
         <div className="min-h-screen h-screen flex overflow-hidden">

{/* Left Form Section */}
<div className="w-1/2 flex items-center justify-center bg-white p-10">
<form onSubmit={handleSubmit} className="w-full border-gray-500 rounded-3xl p-9 shadow-2xl">
  <h1 className="text-3xl font-bold mb-4 text-blue-800 text-center">Sign Up</h1>

  {step === 1 && (
    <>
      <h2 className="text-xl font-semibold mb-4 text-green-700">College Details</h2>
      <label className="block mb-1 text-black">Name:</label>
      <input
        type="text"
        value={collegeName}
        onChange={(e) => setCollegeName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded text-black"
        placeholder="Your College Name"
      />
      {collegeErrors.college_name && (
        <p className="text-red-500 text-sm mt-1">{collegeErrors.college_name}</p>
      )}
    <div className="flex gap-4 mb-4">
        <div className="w-1/2">
        <label className="block mb-1 text-black">College Code:</label>
        <input
          type="number"
          value={collegeCode}
          onChange={(e) => setCollegeCode(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-black"
          placeholder="Your College Code"
        />
        {collegeErrors.college_code && (
          <p className="text-red-500 text-sm mt-1">{collegeErrors.college_code}</p>
        )}

        </div>
        <div className="w-1/2">
          <label className="block mb-1 text-black">College Phno.:</label>
            <input
              type="tel"
              value={collegePhno}
              onChange={(e) => setCollegePhno(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black"
              placeholder="Your College Phno"
            />
          {collegeErrors.college_phno && (
            <p className="text-red-500 text-sm mt-1">{collegeErrors.college_phno}</p>
          )}

        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="w-1/2">
          <label className="block mb-1 text-black">Email:</label>
          <input  
            type="email"
            value={collegeEmail}
            onChange={(e) => setCollegeEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Your College Email"
          />
          {collegeErrors.college_email && (
            <p className="text-red-500 text-sm mt-1">{collegeErrors.college_email}</p>
          )}

        </div>
        <div className="w-1/2">
          <label className="block mb-1 text-black">Address:</label>
            <textarea
              rows="3"
              value={collegeAddr}
              onChange={(e) => setCollegeAddr(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black"
              placeholder="Your College Addr"
            />
            {collegeErrors.college_address && (
              <p className="text-red-500 text-sm mt-1">{collegeErrors.college_address}</p>
            )}    

        </div>
      </div>
      <label className="block mb-1 text-black">Upload College Proof Document:</label>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
      />
      {collegeErrors.college_documents && (
        <p className="text-red-500 text-sm mt-1">{collegeErrors.college_documents}</p>
      )}
      <small className="text-gray-600">
        (Acceptable documents: Affiliation Certificate, NOC, University Letter, etc.)
      </small>  
      

      {/* ... all other step 1 fields same ... */}
      <label className="block mb-2 font-semibold">Programmes your college offers:</label>
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-1 text-black">
          <input type="checkbox" checked={programmes.junior}
            onChange={() => setProgrammes((prev) => ({ ...prev, junior: !prev.junior }))} />
          <span>Junior College</span>
        </label>
        <label className="flex items-center space-x-2 text-black">
          <input type="checkbox" checked={programmes.ug}
            onChange={() => setProgrammes((prev) => ({ ...prev, ug: !prev.ug }))} />
          <span>Under Graduate</span>
        </label>
        <label className="flex items-center space-x-2 text-black">
          <input type="checkbox" checked={programmes.pg}
            onChange={() => setProgrammes((prev) => ({ ...prev, pg: !prev.pg }))} />
          <span>Post Graduate</span>
        </label>
        {collegeErrors.programmes && (
          <p className="text-red-500 text-sm mt-1">{collegeErrors.programmes}</p>
        )}
      </div> {/* <-- yeh checkbox wala div close kar diya */}

    {collegeErrors.alreadyExistsMessage && (
      <div className="mt-3">{collegeErrors.alreadyExistsMessage}</div>
    )}

    <button onClick={handleNext} className="bg-green-500 hover:bg-green-600 text-white mt-3 px-4 py-2 rounded">Next</button>
    </>
  )}

  {step === 2 && (
    <>
      <h2 className="text-xl font-semibold mb-4 text-green-700">College Admin Details</h2>
      <label className="block mb-1 text-black">Name:</label>
      <input
        type="text"
        value={principalName}
        onChange={(e) => setPrincipalName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
        placeholder="College Admin Name"
      />
      {principalErrors.college_admin_name && (
        <p className="text-red-500 text-sm mt-1">{principalErrors.college_admin_name}</p>
      )}

      <label className="block mb-1 text-black">Email:</label>
      <input
        type="email"
        value={principalEmail}
        onChange={(e) => setPrincipalEmail(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
        placeholder="College Admin Email"
      />
      {principalErrors.college_admin_email && (
        <p className="text-red-500 text-sm mt-1">{principalErrors.college_admin_email}</p>
      )}

      <label className="block mb-1 text-black">Phno:</label>
      <input
        type="tel"
        value={principalPhno}
        onChange={(e) => setPrincipalPhno(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
        placeholder="College Admin Phone"
      />
      {principalErrors.college_admin_phno && (
        <p className="text-red-500 text-sm mt-1">{principalErrors.college_admin_phno}</p>
      )}
      <label className="block mb-1 text-black">Username:</label>
      <input
        type="text"
        value={principalUsername}
        onChange={(e) => setPrincipalUsername(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
        placeholder="Create a username" 
      />
      {principalErrors.college_admin_username === "Username already exists. Please login here." ? (
        <p className="text-sm text-red-500">Username already exists. Please{" "}
          <span
            className="text-blue-600 underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            login here
          </span>.
        </p>
      ) : principalErrors.college_admin_username ? (
        <p className="text-red-500 text-sm mt-1">{principalErrors.college_admin_username}</p>
      ) : null}


      <label className="block mb-1 text-black">Password:</label>
      <input
        type="password"
        value={principalPassword}
        onChange={(e) => setPrincipalPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
        placeholder="College Admin Password"
      />
      {principalErrors.college_admin_password && (
        <p className="text-red-500 text-sm mt-1">{principalErrors.college_admin_password}</p>
      )}
      <label className="block mb-1 text-black">Confirm Password:</label>
      <input
        type="password"
        value={principalConfirmPassword}
        onChange={(e) => setPrincipalConfirmPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
        placeholder="Confirm Admin Password"
      />
      {principalErrors.college_admin_confirm_password && (
        <p className="text-red-500 text-sm mt-1">{principalErrors.college_admin_confirm_password}</p>
      )}
      {/* ... step 2 inputs here ... */}
      <div className="flex justify-between">
        <button type="button" onClick={handleBack} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Back</button>
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Sign Up</button>
      </div>
    </>
  )}
</form>
</div>

{/* Right Info Section */}
<div className="w-1/2 bg-gradient-to-br from-[#1D5C84]
to-[#0A3D62] text-white p-10 flex flex-col justify-center">
<div className="max-w-md mx-auto text-center">
  
  <h1 className="text-4xl font-bold mb-4">Welcome</h1>
  {successMessage && (
    <p className="bg-green-600 text-white font-medium p-2 rounded-lg mt-4 shadow-md">
  {successMessage}
    </p>
    )}

  <p className="text-lg">You're about to simplify college notice management.</p>
  <p className="mt-6 text-purple-300">Fill the form and get started with <span className="text-white font-semibold">CampusNotify</span>.</p>
</div>
</div>
</div>
    </>
    );
  }

  export default SignUp;
