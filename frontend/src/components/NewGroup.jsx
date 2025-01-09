import React, { useState } from "react";
import { TextField, Button, Snackbar, Alert } from "@mui/material";

const NewGroupMenu = () => {
  const [chatName, setChatName] = useState("");
  const [chatImage, setChatImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Function to handle form submission (creating the new chat)
  const handleCreateChat = () => {
    if (!chatName || !chatImage) {
      setError("Both fields are required.");
      return;
    }

    // Mock API call to create the new chat
    // Here, you would make an actual API call (e.g., to your backend)
    setTimeout(() => {
      console.log("New chat created with name:", chatName);
      setSuccess(true); // Show success message
      setChatName(""); // Reset form
      setChatImage(""); // Reset form
      setError(""); // Reset error
    }, 1000);
  };

  return (
    <div>
      {/* Simple Create Chat Form */}
      <h2>Create New Chat</h2>
      <TextField
        label="Chat Name"
        type="text"
        fullWidth
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
        error={!!error} // Show error styling if there's an error
        helperText={error && "Please enter a valid chat name"}
        margin="normal"
      />
      <TextField
        label="Chat Image URL"
        type="text"
        fullWidth
        value={chatImage}
        onChange={(e) => setChatImage(e.target.value)}
        error={!!error} // Show error styling if there's an error
        helperText={error && "Please enter a valid image URL"}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateChat}
        fullWidth
        style={{ marginTop: "16px" }}
      >
        Create Chat
      </Button>

      {/* Snackbar for success message */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          New chat created successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default NewGroupMenu;
