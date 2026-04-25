const departmentMapper = (issueType) => {
  switch (issueType) {
    case "garbage":
      return {
        department: "Sanitation Department",
        authority: "Nagar Nigam",
      };

    case "open_manhole":
      return {
        department: "Sewerage Department",
        authority: "Jal Nigam",
      };

    case "potholes":
      return {
        department: "Public Works Department",
        authority: "Nagar Nigam",
      };

    case "streetlight_bad":
      return {
        department: "Electricity Department",
        authority: "State Power Corporation",
      };

    case "streetlight_good":
      return {
        department: "Electricity Department",
        authority: "State Power Corporation",
      };

    default:
      return {
        department: "General Complaint Cell",
        authority: "Municipal Corporation",
      };
  }
};

export default departmentMapper;
