import { Box, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaExclamationTriangle } from "react-icons/fa"; // Import both icons
import img from "../assets/404.svg";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      flexDirection="column"
      bgImage={`url(${img})`}
      bgSize="cover"
      bgPosition="center"
      color="white"
    >
      <FaExclamationTriangle size={90} /> {/* Larger Not Found Icon */}
      <Text fontSize="6xl" fontWeight="bold" mt={4}>
        404
      </Text>
      <Text fontSize="2xl" mt={2} textAlign="center">
        Oops! The page you are looking for doesn't exist.
      </Text>
      <Button
        mt={8}
        colorScheme="teal"
        leftIcon={<FaHome />} // Home icon on button
        onClick={() => navigate("/")}
        border="1px solid black"
        boxShadow="lg"
        _hover={{
          bg: "teal.500",
          transform: "scale(1.05)",
        }}
      >
        Return to Home
      </Button>
    </Box>
  );
};

export default NotFound;
