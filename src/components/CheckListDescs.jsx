// CheckListDescs.jsx
import React from "react";
import styles from "./CheckListDescs.module.css"; // Updated to import the new CSS Module

const CheckListDescs = ({
  descriptions,
  submittedDescriptions,
  onDescriptionClick,
  onShowPopup,
}) => {
  console.log(descriptions);
  return (
    <div>
      <h2 className={styles.header}>Descriptions</h2>
      {descriptions.length === 0 ? (
        <p>No descriptions available</p>
      ) : (
        descriptions.map(item => (
          <div
            key={item.uniqueId}
            className={`${styles.descriptionItem} ${
              submittedDescriptions.has(item.description)
                ? styles.bgGreen
                : styles.bgGray
            }`}
            onClick={() => onDescriptionClick(item)}
          >
            {item.description}
          </div>
        ))
      )}
    </div>
  );
};

export default CheckListDescs;
