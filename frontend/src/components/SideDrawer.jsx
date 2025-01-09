import React, { useEffect, useState } from "react";
import {
  Box,
  Input,
  Avatar,
  Stack,
  Text,
  Flex,
  Button,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { Consumer } from "../store/StoreToken";
import ChatLoading from "./ChatLoading";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authorizedToken, setSelectedChat, chats, setChats } = Consumer();
  const toast = useToast();

  // Fetch users from the backend
  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/user/allUsers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: authorizedToken,
            },
          }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Unexpected data format:", data);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast({
          title: "Error occurred",
          status: "error",
          isClosable: true,
          position: "bottom-left",
          duration: 5000,
        });
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [authorizedToken]); // Dependency added for the authorizedToken

  const onChatSelect = async (userId) => {
    console.log("Selected User ID:", userId);
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizedToken,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (response.ok) {
        if (
          Array.isArray(chats) &&
          !chats.some((chat) => chat._id === data._id)
        ) {
          setChats([data, ...chats]);
        }

        setSelectedChat(data);
      } else {
        toast({
          title: "Error creating chat",
          status: "error",
          isClosable: true,
          position: "bottom-left",
          duration: 5000,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error occurred",
        status: "error",
        isClosable: true,
        position: "bottom-left",
        duration: 5000,
      });
      console.error("Error creating chat:", error);
    }
  };

  const handleFind = () => {
    if (!search) {
      toast({
        title: "Please Enter something to search",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  return (
    <>
      <Box>
        <Box display="flex" pd={2} justifyContent={"space-around"} gap={3}>
          <Input
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb={4}
          />
          <Button onClick={handleFind}>Find</Button>
        </Box>

        <Stack>
          {loading ? (
            <ChatLoading />
          ) : (
            <>
              {Array.isArray(users) && users.length > 0 ? (
                users
                  .filter((user) =>
                    user.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((user) => (
                    <Box
                      key={user._id}
                      p={3}
                      borderRadius="md"
                      bg="gray.100"
                      _hover={{ bg: "teal.100" }}
                      cursor="pointer"
                      onClick={() => onChatSelect(user._id)} // Assuming user object is passed to onChatSelect
                    >
                      <Flex align="center">
                        <Avatar src={user.avatar || ""} mr={3} />
                        <Box>
                          <Text fontWeight="bold">{user.name}</Text>
                          <Text fontSize="sm">{user.email}</Text>
                        </Box>
                      </Flex>
                    </Box>
                  ))
              ) : (
                <Text>No users found</Text>
              )}
            </>
          )}
        </Stack>
      </Box>
      {loading && <Spinner ml="auto" display="flex" />}
    </>
  );
};

export default SideDrawer;
