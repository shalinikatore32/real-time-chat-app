import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
  Spinner,
  Text,
  Box,
  Avatar,
  Spacer,
  Card,
  CardBody,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { Consumer } from "../store/StoreToken";

const GroupChat = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
  const { user, chats, setChats, authorizedToken } = Consumer();

  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSearch = async (query) => {
    setSearch(query);
    if (search.length > 0) {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/user/users?search=${search}`,
        {
          method: "GET",
          headers: {
            Authorization: authorizedToken,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      setSearchResults(data);
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectedUsers = (userToAdd) => {
    if (
      selectedUsers.some((selectedUser) => selectedUser._id === userToAdd._id)
    ) {
      toast({
        title: "User already selected.",
        description: "User is already selected.",
        status: "warning",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    // Add the new user to the selected users array
    setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, userToAdd]);
  };

  // Ensure the logged-in user is added to the selected users initially
  React.useEffect(() => {
    if (
      user &&
      !selectedUsers.some((selectedUser) => selectedUser._id === user._id)
    ) {
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
    }
  }, [user, selectedUsers]);

  const handleChatCreation = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Every field is required",
        description: "Please enter a chat name.",
        status: "warning",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    const response = await fetch("http://localhost:5000/api/chat/group-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizedToken,
      },
      body: JSON.stringify({
        name: groupChatName,
        users: selectedUsers.map((user) => user._id), // Send as an array of user IDs
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setChats([...chats, data]);
      toast({
        title: "Chat Created.",
        description: "Chat has been created successfully.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      onClose();
    }
  };

  const handleDelete = (user) => {
    const newUsers = selectedUsers.filter((selectedUser) => {
      return selectedUser !== user;
    });
    setSelectedUsers(newUsers);
  };

  return (
    <>
      <Button onClick={onOpen} border="1px black">
        {children}
      </Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Create Group Chats
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} display={"flex"} flexDirection={"column"}>
            <FormControl>
              <FormLabel>Chat Name</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Enter Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Add users</FormLabel>
              <Input
                placeholder="Enter User Name"
                mb={3}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box mt={4}>
              <Text fontWeight="bold" mb={2}>
                Selected Users
              </Text>
              <Flex wrap="wrap" gap={2}>
                {selectedUsers.map((user) => (
                  <Badge
                    key={user._id}
                    px={3}
                    py={1}
                    borderRadius="full"
                    colorScheme="blue"
                    display="flex"
                    alignItems="center"
                  >
                    {user.name}
                    <CloseIcon
                      w={3}
                      h={3}
                      ml={2}
                      cursor="pointer"
                      onClick={() => handleDelete(user)}
                    />
                  </Badge>
                ))}
              </Flex>
            </Box>

            {loading ? (
              <Spinner />
            ) : (
              searchResults.map((user) => (
                <Card
                  key={user._id}
                  mt={3}
                  p={4}
                  boxShadow="md"
                  borderRadius="lg"
                >
                  <CardBody display="flex" alignItems="center">
                    <Avatar
                      name={user.name}
                      src={user.profilePicture}
                      size="md"
                    />
                    <Box ml={4}>
                      <Text fontWeight="bold">{user.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {user.email}
                      </Text>
                    </Box>
                    <Spacer />
                    <Button
                      colorScheme="blue"
                      onClick={() => handleSelectedUsers(user)}
                    >
                      Select
                    </Button>
                  </CardBody>
                </Card>
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleChatCreation}>
              Create Chat
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChat;
