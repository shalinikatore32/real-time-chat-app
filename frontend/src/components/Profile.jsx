import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Box,
  Button,
  Avatar,
  Text,
  VStack,
  Input,
  Stack,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { Consumer } from "../store/StoreToken";

// Import statements remain the same...

const Profile = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // Profile Modal
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure(); // Edit Profile Modal
  const navigate = useNavigate();
  const toast = useToast();

  const finalRef = React.useRef(null);
  const { user, setUser, authorizedToken } = Consumer(); // Assuming Consumer provides setUser for updating user data

  // State for editing profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with user data when Edit Profile modal opens
  const handleEditProfile = () => {
    // Sync state with the current user data
    setName(user?.name || "");
    setEmail(user?.email || "");
    setProfilePic(user?.profilePic || "");
    onClose(); // Close the profile modal
    onEditOpen(); // Open the edit profile modal
  };

  // Handle Save Changes API call using fetch
  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/user/profile/edit",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizedToken,
          },
          body: JSON.stringify({ name, email, profilePic }),
        }
      );

      if (!response.ok) {
        return toast({
          title: "Failed to update profile",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }

      const data = await response.json();
      toast({
        title: "Profile Updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      setUser(data.user); // Update user state in context
      onEditClose();
      navigate("/logout");
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          icon={<ViewIcon />}
          onClick={onOpen}
          aria-label="View Profile"
        />
      )}

      <Box ref={finalRef} tabIndex={-1} aria-label="Focus moved to this box" />

      {/* Profile Modal */}
      <Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" alignItems="center">
            <Avatar size="xl" name={user?.name} src={user?.profilePic} mr={3} />
            <VStack align="start" ml={3}>
              <Text fontSize="lg" fontWeight="bold">
                {user?.name || "User Name"}
              </Text>
              <Text color="gray.500">{user?.email || "user@example.com"}</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text fontSize="md" color="gray.600">
              Additional user profile data can go here...
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" onClick={handleEditProfile}>
              Edit Profile
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Profile Picture URL</FormLabel>
                <Input
                  placeholder="Enter profile picture URL"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSaveChanges}
              isLoading={isSaving}
              loadingText="Saving"
            >
              Save Changes
            </Button>
            <Button variant="outline" onClick={onEditClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Profile;
