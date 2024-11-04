import React, { useState, useEffect } from "react";
import Popup from "./Popup";
import CheckListDescs from "./CheckListDescs";
import { createClient } from "@supabase/supabase-js";
import styles from "./CheckList.module.css";
import { ChecklistTable } from "../../config.js";

// Create a Supabase client
const supabase = createClient(
  ChecklistTable.SUPABASE_URL,
  ChecklistTable.SUPERBASE_CHECKLIST
);

// Define checklist details
export const checklistDetails = {
  "5K": "5k_checklist",
  T1: "T1_checklist",
  T2: "T2_checklist",
  Fresho: "Fresho_checklist",
  T1: "T1_checklist",
  T4: "T4_checklist",
};

function CheckList({ user, setUser }) {
  const [checklist, setChecklist] = useState("");
  const [location, setLocation] = useState("");
  const [owner, setOwner] = useState("");
  const [department, setDepartment] = useState("");
  const [descriptions, setDescriptions] = useState([]);
  const [allDescriptions, setAllDescriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checklistOptions, setChecklistOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [submittedDescriptions, setSubmittedDescriptions] = useState(new Set());
  const [userAccessLoc, setUserAccessLoc] = useState([]);
  const [userAccessLob, setUserAccessLob] = useState([]);

  // Fetch user's access LOB and location permissions
  const fetchUserAccessData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users_details")
        .select("access_lob, access_loc")
        .eq("mail_Id", user);

      if (error) throw error;

      if (data && data.length > 0) {
        const userData = data[0]; // Take the first result
        const accessLob =
          userData.access_lob?.split(",").map(lob => lob.trim()) || [];
        const accessLoc =
          userData.access_loc?.split(",").map(loc => loc.trim()) || [];

        setChecklistOptions(accessLob);
        setUserAccessLoc(accessLoc);
        setUserAccessLob(accessLob);
      } else {
        console.warn(`No access data found for the user with email ${user}`);
        setChecklistOptions([]);
        setUserAccessLoc([]);
        setUserAccessLob([]);
      }
    } catch (error) {
      console.error("Error fetching user access data:", error.message);
      setChecklistOptions([]);
      setUserAccessLoc([]);
      setUserAccessLob([]);
    } finally {
      setLoading(false);
    }
  };

  function CheckList() {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.backgroundShapes}>
          <div className={styles.backgroundShape}></div>
          <div className={styles.backgroundShape}></div>
          <div className={styles.backgroundShape}></div>
        </div>
        <div className={styles.container}>
          <header className={styles.header}>Checklist</header>
          <label className={styles.label} htmlFor="input">
            Description
          </label>
          <input
            className={styles.input}
            id="input"
            placeholder="Enter details"
          />
          <button className={`${styles.button} ${styles.submitButton}`}>
            Submit
          </button>
          <button className={`${styles.button} ${styles.cancelButton}`}>
            Cancel
          </button>
          <div className={styles.descriptionItem}>Sample Description</div>
        </div>
      </div>
    );
  }

  // Fetch locations based on selected checklist and user access location
  const fetchLocationData = async () => {
    if (!checklist) return;

    setLoading(true);
    try {
      const { data: locationsData, error: locationError } = await supabase
        .from("locations")
        .select("locationname, bl")
        .eq("bl", checklist)
        .in("locationname", userAccessLoc);

      if (locationError) throw locationError;

      setLocationOptions(locationsData.map(item => item.locationname));
    } catch (error) {
      console.error("Error fetching location data:", error.message);
      setLocationOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch checklist descriptions
  const fetchDescriptions = async () => {
    if (!checklist) return;

    setLoading(true);
    try {
      const tableName = checklistDetails[checklist];
      const { data: checklistData, error: checklistError } = await supabase
        .from(tableName)
        .select("si_num, owner, department, description, unique_id, impact");

      if (checklistError) throw checklistError;

      const uniqueOwners = new Set();
      const uniqueDepartments = new Set();
      const data = checklistData.map(item => {
        if (item.owner) uniqueOwners.add(item.owner);
        if (item.department) uniqueDepartments.add(item.department);

        return {
          description: item.description,
          owner: item.owner || "",
          department: item.department || "",
          uniqueId: item.unique_id,
          impact: item.impact,
        };
      });

      setAllDescriptions(data);
      setDescriptions(data);
      setOwnerOptions([...uniqueOwners]);
      setDepartmentOptions([...uniqueDepartments]);
    } catch (error) {
      console.error("Error fetching descriptions:", error.message);
      setAllDescriptions([]);
      setDescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial user email load
  useEffect(() => {
    const storedUserEmail = localStorage.getItem("UserMail");
    if (!user && storedUserEmail) {
      setUser(storedUserEmail);
    }
  }, []);

  // Update local storage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("UserMail", user);
    }
  }, [user]);

  // Load user access data when user changes
  useEffect(() => {
    if (user) {
      fetchUserAccessData();
    }
  }, [user]);

  // Update locations when checklist changes
  useEffect(() => {
    fetchLocationData();
  }, [checklist, userAccessLoc]);

  // Update descriptions when checklist changes
  useEffect(() => {
    fetchDescriptions();
  }, [checklist]);

  // Filter descriptions by owner
  useEffect(() => {
    if (owner) {
      const filteredDescriptions = allDescriptions.filter(
        item => item.owner === owner
      );
      setDescriptions(filteredDescriptions);

      const uniqueDepartments = new Set(
        filteredDescriptions.map(item => item.department)
      );
      setDepartmentOptions([...uniqueDepartments]);
      setDepartment("");
    } else {
      setDescriptions(allDescriptions);
      setDepartmentOptions([
        ...new Set(allDescriptions.map(item => item.department)),
      ]);
      setDepartment("");
    }
  }, [owner, allDescriptions]);

  // Filter descriptions by department
  useEffect(() => {
    if (owner) {
      let filteredDescriptions;
      if (department) {
        filteredDescriptions = allDescriptions.filter(
          item => item.owner === owner && item.department === department
        );
      } else {
        filteredDescriptions = allDescriptions.filter(
          item => item.owner === owner
        );
      }
      setDescriptions(filteredDescriptions);
    } else {
      setDescriptions(allDescriptions);
    }
  }, [department, owner, allDescriptions]);

  const openPopup = desc => {
    if (!location) {
      alert("Please select a location first");
      return;
    }
    setSelectedDescription(desc);
    setShowPopup(true);
  };

  const handleSubmitSuccess = desc => {
    setSubmittedDescriptions(prev => new Set([...prev, desc.description]));
    setShowPopup(false);
  };

  // Handlers for select changes
  const handleChecklistChange = e => setChecklist(e.target.value);
  const handleLocationChange = e => setLocation(e.target.value);
  const handleOwnerChange = e => setOwner(e.target.value);
  const handleDepartmentChange = e => setDepartment(e.target.value);
  const handleSearchChange = e => setSearch(e.target.value);

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Checklist App</h1>
      <div className={styles.formGroup}>
        <label className={styles.label}>Checklist:</label>
        <select
          value={checklist}
          onChange={handleChecklistChange}
          className={styles.input}
        >
          <option value="">--Select--</option>
          {userAccessLob.map((item, idx) => (
            <option key={idx} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Location:</label>
        <select
          value={location}
          onChange={handleLocationChange}
          className={styles.input}
        >
          <option value="">--Select Location--</option>
          {locationOptions.map((item, idx) => (
            <option key={idx} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Owner:</label>
        <select
          value={owner}
          onChange={handleOwnerChange}
          className={styles.input}
        >
          <option value="">--Select Owner--</option>
          {ownerOptions.map((item, idx) => (
            <option key={idx} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Department:</label>
        <select
          value={department}
          onChange={handleDepartmentChange}
          className={styles.input}
        >
          <option value="">--Select Department--</option>
          {departmentOptions.map((item, idx) => (
            <option key={idx} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Search Description:</label>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          className={styles.input}
          placeholder="Search..."
        />
      </div>
      {checklist && location && (
        <CheckListDescs
          descriptions={descriptions.filter(item =>
            item.description.toLowerCase().includes(search.toLowerCase())
          )}
          submittedDescriptions={submittedDescriptions}
          onDescriptionClick={openPopup}
        />
      )}

      {showPopup && (
        <Popup
          bl={checklist}
          closedBy={user}
          selectedDescription={selectedDescription}
          location={location}
          department={department}
          owner={owner}
          onSubmitSuccess={handleSubmitSuccess}
          Onclose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

export default CheckList;
