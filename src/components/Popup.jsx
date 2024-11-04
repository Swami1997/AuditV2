import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import styles from "./Popup.module.css";

// Supabase configuration
const supabaseUrl = "https://curiyuhbogniwihegepc.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1cml5dWhib2duaXdpaGVnZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1MTAxOTEsImV4cCI6MjA0NjA4NjE5MX0.xGDJYccvD1VNYvSBrnwcR6eMnCg-EK9l7fHkB1ost4A";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Popup = ({
  selectedDescription,
  allDescriptions,
  Onclose,
  onSubmitSuccess,
  bl,
  closedBy,
  location,
}) => {
  const [score, setScore] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const popupOverlay = document.querySelector(`.${styles.popupOverlay}`);
    const popupContainer = document.querySelector(`.${styles.popupContainer}`);
    const formGroups = document.querySelectorAll(`.${styles.formGroup}`);

    function openPopup() {
      popupOverlay.classList.remove(styles.fadeOut);
      popupContainer.classList.remove(styles.scaleDown);
      popupOverlay.classList.add(styles.fadeIn);
      popupContainer.classList.add(styles.advancedFadeIn);

      formGroups.forEach((group, index) => {
        group.classList.remove(
          styles.slideOutLeft,
          styles.slideOutRight,
          styles.slideOutUp,
          styles.slideOutDown
        );
        group.classList.add(styles.slideIn);
        group.style.animationDelay = `${0.5 + index * 0.1}s`;
      });
    }

    function closePopup() {
      popupOverlay.classList.remove(styles.fadeIn);
      popupContainer.classList.remove(styles.advancedFadeIn);
      popupOverlay.classList.add(styles.fadeOut);
      popupContainer.classList.add(styles.scaleDown);

      formGroups.forEach((group, index) => {
        group.classList.remove(styles.slideIn);
        const direction = index % 4;
        if (direction === 0) {
          group.classList.add(styles.slideOutLeft);
        } else if (direction === 1) {
          group.classList.add(styles.slideOutRight);
        } else if (direction === 2) {
          group.classList.add(styles.slideOutUp);
        } else {
          group.classList.add(styles.slideOutDown);
        }
        group.style.animationDelay = `${index * 0.1}s`;
      });
    }

    // Open the popup when the component mounts
    openPopup();

    // Cleanup function to close the popup when the component unmounts
    return () => {
      closePopup();
    };
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!score) {
      alert("Please select a score");
      return;
    }

    if (score !== "5" && !remarks) {
      alert("Remarks are required for the selected score");
      return;
    }

    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedTime = currentDate.toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Check if the unique_id already exists
      const { data: existingData, error: checkError } = await supabase
        .from("audit_reports")
        .select("unique_id")
        .eq("unique_id", selectedDescription.uniqueId);

      if (checkError) {
        throw checkError;
      }

      if (existingData.length > 0) {
        alert(
          "A report with this unique ID already exists. Please check the ID."
        );
        return; // or handle as needed
      }

      // Determine the audit number
      const { data: countData, error: countError } = await supabase
        .from("audit_reports")
        .select("*", { count: "exact" })
        .eq("unique_id", selectedDescription.uniqueId)
        .eq("owner", selectedDescription.owner)
        .eq("unit_name", location)
        .eq("business_line", bl);

      if (countError) {
        throw countError;
      }

      const auditNum = `Audit ${countData.length + 1}`;

      // Prepare the data for submission
      const auditData = {
        id: crypto.randomUUID(), // Create a unique ID for the audit report
        unique_id: selectedDescription.uniqueId,
        owner: selectedDescription.owner,
        department: selectedDescription.department,
        description: selectedDescription.description,
        unit_name: location,
        impact: selectedDescription.impact,
        business_line: bl,
        rating: score,
        remarks: remarks,
        date_completed: formattedDate,
        time_completed: formattedTime,
        closed_by: closedBy,
        audit_num: auditNum,
        user_location: [
          /* Fetch and insert user latitude and longitude here */
        ],
      };

      // Submit to Supabase
      const { data, error } = await supabase
        .from("audit_reports")
        .insert([auditData]);

      if (error) {
        throw error;
      }

      onSubmitSuccess(selectedDescription);
      alert("Audit report submitted successfully!");
      closePopup();
    } catch (error) {
      console.error("Error submitting audit report:", error);
      alert(`Error submitting audit report: ${error.message}`);
    }
  };

  function closePopup() {
    setRemarks("");
    setScore("");
    Onclose();
  }

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <div className={styles.popupTitle}>
          <h3>Audit Form</h3>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="description">
              <i className="fas fa-info-circle"></i> Description
            </label>
            <p className={styles.description}>
              {selectedDescription.description}
            </p>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="score">
              <i className="fas fa-star"></i> Score*
            </label>
            <select
              id="score"
              value={score}
              onChange={e => setScore(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Select Score</option>
              <option value="1">1</option>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="0">0</option>
              <option value="NA">NA</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="remarks">
              <i className="fas fa-comment"></i> Remarks{score !== "5" && "*"}
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className={styles.textarea}
              required={score !== "5"}
            />
          </div>
          <div className={styles.flexContainer}>
            <button
              type="submit"
              className={`${styles.button} ${styles.submitButton}`}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={closePopup}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Popup;
