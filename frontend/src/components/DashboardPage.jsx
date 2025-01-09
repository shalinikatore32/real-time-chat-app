import React, { useEffect, useState } from "react";
import GroupChat from "./GroupChat";
import { io } from "socket.io-client";
import Lottie from "react-lottie";
import {
  ChakraProvider,
  Box,
  Flex,
  Stack,
  Text,
  Button,
  Input,
  Avatar,
  IconButton,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Tooltip,
  useToast,
} from "@chakra-ui/react";

import { FaSearch, FaSmile, FaPaperPlane, FaBell } from "react-icons/fa";
import {
  FiLogOut,
  FiMoreVertical,
  FiPlus,
  FiPlusCircle,
  FiPlusSquare,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { Link } from "react-router-dom";
import { Consumer } from "../store/StoreToken";

import SideDrawer from "./SideDrawer";
import Profile from "./Profile";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/Chat";
import animationData from "./animations/lottie-animation.json";

const ENDPOINT = "http://localhost:5000/";

var socket, selectChatComp;

const DashboardPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [socketConnection, setSocketConnection] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIstyping] = useState(false);
  const toast = useToast();
  const {
    authorizedToken,
    user,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
  } = Consumer();

  const defaultOptions = {
    loop: true,
    autoplay: true, // Animation will start automatically
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("setup", user);

    socket.on("connected", () => setSocketConnection(true));
    socket.on("typing", () => setIstyping(true));
    socket.on("stop typing", () => setIstyping(false));

    socket.on("message received", (newMessage) => {
      if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
        // Optionally add notifications for new messages in other chats
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [selectedChat]);

  useEffect(() => {
    fetchChatMessages();
    selectChatComp = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    fetchChats();
  }, [authorizedToken]);

  useEffect(() => {
    socket.on("message received", (newMessage) => {
      if (!selectChatComp || selectChatComp._id !== newMessage.chat._id) {
      } else {
        setMessages([...messages, newMessage]);
      }
    });
  });

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  const fetchChats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/`, {
        method: "GET",
        headers: {
          Authorization: authorizedToken,
        },
      });
      const data = await response.json();
      console.log("Chat data", data); // Log chat data here
      setChats(data);
    } catch (error) {
      toast({
        title: "Error occurred",
        status: "error",
        duration: 5000,
        position: "bottom-left",
        isClosable: true,
      });
    }
  };
  const fetchChatMessages = async () => {
    if (!selectedChat) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/message/all/${selectedChat._id}`,
        {
          method: "GET",
          headers: {
            Authorization: authorizedToken,
          },
        }
      );
      const data = await response.json();
      setMessages(data);
      console.log("Chat messages", data);

      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error occured fetching chat messages",
        duration: 5000,
        status: "error",
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleSendMessage = async () => {
    setNewMessage(""); // Reset the message input field
    socket.emit("stop typing", selectedChat._id);
    try {
      const response = await fetch("http://localhost:5000/api/message/send", {
        method: "POST",
        headers: {
          Authorization: authorizedToken,
          "Content-Type": "application/json", // Make sure the content type is correct
        },
        body: JSON.stringify({
          message: newMessage,
          chatId: selectedChat._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log(data);

      // Update messages state using previous state to avoid potential issues with stale state
      socket.emit("send message", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSearchInput = (e) => {
    setSearch(e.target.value);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnection || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleSearchChat = () => {
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <ChakraProvider>
      <Flex height="100vh" direction="row">
        <Box
          width={{ base: "", md: "96" }} // Ensure consistent naming (width instead of w for clarity)
          backgroundColor="gray.900" // Use full property names for better readability
          color="white"
          padding={4}
          overflowY="auto"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Avatar size="lg" src={user.profilePic} />
            <Flex>
              <Flex mb={4} align="center" display="flex">
                <Tooltip
                  hasArrow
                  placement="bottom-end"
                  label="Search for chatting"
                >
                  <Button
                    onClick={handleSearchChat}
                    colorScheme="teal"
                    size="sm"
                    ml={2}
                    mt={1}
                    mr={4}
                    p={0}
                    color="gray.200"
                    bg={"blackAlpha.200"}
                    rightIcon={<FaSearch />}
                  ></Button>
                </Tooltip>
              </Flex>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FaBell />}
                  variant="ghost"
                  aria-label="Notifications"
                  colorScheme="whiteAlpha"
                  mr={4}
                />
                <MenuList
                  bg="white"
                  color="black"
                  border={3}
                  borderColor="black.200"
                >
                  <MenuItem>View Notifications</MenuItem>
                  <MenuItem>Mark all as read</MenuItem>
                </MenuList>
              </Menu>

              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  aria-label="Options"
                  colorScheme="whiteAlpha"
                  marginLeft={4}
                />
                <MenuList
                  bg="white"
                  color="black"
                  border={3}
                  borderColor="black.200"
                >
                  <GroupChat>
                    <Link>New group</Link>
                  </GroupChat>

                  <Profile>
                    <MenuItem display="flex">
                      <Link>View Profile</Link>
                    </MenuItem>
                  </Profile>

                  <MenuItem>
                    <Link to="/logout">Logout</Link>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </Flex>

          <Box
            d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems={{ base: "center", md: "flex-start" }}
            p={3}
            w="100%"
            borderRadius="1g"
            borderWidth="1px"
          >
            <Box
              pb={3}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={3}
              w="100%"
              fontSize="xl"
            >
              Chats
              <GroupChat>
                <Tooltip
                  hasArrow
                  placement="bottom-end"
                  label="Create New Group"
                >
                  <Button display="flex" rightIcon={<FiPlus />}></Button>
                </Tooltip>
              </GroupChat>
            </Box>
            <Box
              display="flex"
              flexDir="column"
              p={3}
              h="100%"
              w="100%"
              borderRadius="5px"
              overflowY="hidden"
              overflow="hidden"
              border="none"
            >
              {chats ? (
                <Stack overflowY="scroll" overflow="hidden">
                  {chats.map((chat) => (
                    <Box
                      onClick={() => handleChatClick(chat)}
                      cursor={"pointer"}
                      bg={selectedChat === chat ? "teal.500" : "white"}
                      color={selectedChat === chat ? "white" : "black"}
                      borderRadius="5px"
                      display="flex"
                      alignItems="center"
                      p={3}
                      px={3}
                      py={2}
                      key={chat._id}
                    >
                      {chat.users && chat.users.length > 0 ? (
                        <>
                          <Avatar
                            name={chat.users[0]?.name}
                            src={chat.users[0]?.profilePic}
                            mr={3}
                          ></Avatar>
                          <Box>
                            {!chat.isGroupChat
                              ? getSender(user, chat.users)
                              : `${chat.chatName}`}
                          </Box>
                        </>
                      ) : (
                        <Text>No users available</Text> // Fallback in case no users are present
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <ChatLoading />
              )}
            </Box>
          </Box>
        </Box>

        {/* Chat Area */}

        <Flex flex="1" direction="column" bg="gray.100">
          {selectedChat ? (
            <Box>
              {/* Chat Header */}
              <Box bg="white" p={4} boxShadow="sm">
                <Flex align="center" justify="space-between">
                  <Flex align="center">
                    {selectedChat.isGroupChat ? (
                      <>
                        <Avatar
                          src={selectedChat.profilePic || "defaultPicUrl"}
                          mr={3}
                        />
                        <Text fontWeight="bold">{selectedChat.chatName}</Text>
                      </>
                    ) : (
                      <>
                        <Avatar
                          src={null} // If no image is available
                          mr={3}
                          name={getSender(user, selectedChat.users)} // This creates an initial fallback
                        ></Avatar>
                        <Text fontWeight="bold">
                          {getSender(user, selectedChat.users)}
                        </Text>
                      </>
                    )}
                  </Flex>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      aria-label="view"
                    />
                    <MenuList>
                      <MenuItem>Profile</MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </Box>

              <Divider />

              {/* Messages */}
              <Box
                flex="1"
                overflowY="auto"
                p={4}
                minHeight="580px"
                maxHeight="580px"
              >
                <Stack spacing={4}>
                  {loading ? (
                    // Check if no messages yet and show "No Message yet" while loading
                    messages.length === 0 ? (
                      <Text>No Message yet</Text>
                    ) : (
                      // Show messages even if they're loading
                      <>
                        {messages.map((message) => (
                          <Flex
                            key={message._id}
                            justify={
                              message.sender._id === user._id
                                ? "flex-end"
                                : "flex-start"
                            }
                          >
                            <Box
                              p={3}
                              bg={
                                message.sender._id === user._id
                                  ? "green.400"
                                  : "gray.200"
                              }
                              color={
                                message.sender._id === user._id
                                  ? "white"
                                  : "black"
                              }
                              borderRadius="lg"
                              maxW="70%"
                            >
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="teal.600"
                              >
                                {message.sender.name}
                              </Text>
                              <Text fontSize="md" color="gray.700" mt={1}>
                                {message.message}
                              </Text>
                            </Box>
                          </Flex>
                        ))}
                      </>
                    )
                  ) : // If loading is done but no messages, show "No Message yet"
                  messages.length === 0 ? (
                    <Text>No Message yet</Text>
                  ) : (
                    // Display messages when there are messages
                    <>
                      {messages.map((message) => (
                        <Flex
                          key={message._id}
                          justify={
                            message.sender._id === user._id
                              ? "flex-end"
                              : "flex-start"
                          }
                        >
                          <Box
                            p={3}
                            bg={
                              message.sender._id === user._id
                                ? "teal.300" // Sender's message
                                : "gray.200" // Receiver's message
                            }
                            color={
                              message.sender._id === user._id
                                ? "white" // Sender's message
                                : "black" // Receiver's message
                            }
                            borderRadius="lg"
                            maxW="70%"
                          >
                            {/* Only show sender's name when the user is the receiver */}
                            {message.sender._id !== user._id && (
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="black.200"
                                align="right"
                              >
                                {message.sender.name}
                              </Text>
                            )}
                            <Text fontSize="md" color="gray.700" mt={1}>
                              {message.message}
                            </Text>
                          </Box>
                        </Flex>
                      ))}
                    </>
                  )}
                </Stack>
              </Box>

              {/* Message Input */}
              {isTyping ? (
                <div>
                  <Lottie options={defaultOptions} height={10} width={30} />
                </div>
              ) : (
                <></>
              )}
              <Box bg="white" p={4}>
                <Flex align="center">
                  <IconButton
                    icon={<FaSmile />}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    aria-label="Emoji"
                    mr={2}
                  />
                  {showEmojiPicker && (
                    <Box position="absolute" bottom="80px" left="20px">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </Box>
                  )}

                  <Input
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleEnterKey}
                    placeholder="Type a message"
                    flex="1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    colorScheme="teal"
                    ml={4}
                    rightIcon={<FaPaperPlane />}
                  >
                    Send
                  </Button>
                </Flex>
              </Box>
            </Box>
          ) : (
            <Flex flex="1" justify="center" align="center">
              <Text fontSize="2xl" color="gray.500">
                Select a chat to start messaging
              </Text>
            </Flex>
          )}
        </Flex>

        {/* SideDrawer Component */}
        <Drawer isOpen={showDrawer} placement="left" onClose={closeDrawer}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Search Chats</DrawerHeader>
            <DrawerBody>
              <SideDrawer />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </ChakraProvider>
  );
};

export default DashboardPage;
