import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Button,
  Heading,
  Input,
  Stack,
  FormControl,
  FormLabel,
  Text,
  useToast,
  Container,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { Consumer } from "../store/StoreToken";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const toast = useToast();
  const { storeToken } = Consumer();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("http://localhost:5000/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }); // Send POST request to login endpoint

    const data = await response.json();
    console.log("Response data:", data);
    if (response.ok === true) {
      storeToken(data.token);
      setTimeout(() => {
        setLoading(false);
        navigate("/dashboard"); // Redirect to dashboard after successful login
      }, 2000);
      toast({
        title: "Login successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } else if (response.status !== 200) {
      console.error("Login failed");
      setLoading(false);
      return;
    } else {
      toast({
        title: data.msg,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };

  return (
    <ChakraProvider>
      <Box
        bg="gray.50"
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Container maxW="container.sm" centerContent>
          <Stack spacing={4} align="center" p={4}>
            <Heading as="h1" size={headingSize} color="teal.500">
              Login to Chat App
            </Heading>
            <Text fontSize="lg" color="gray.700" textAlign="center">
              Enter your credentials to start chatting.
            </Text>

            <Box w="100%" bg="white" p={6} boxShadow="lg" borderRadius="md">
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    isLoading={loading}
                    loadingText="Logging in"
                    width="full"
                  >
                    Login
                  </Button>
                </Stack>
              </form>
              <Text fontSize="sm" color="gray.600" mt={4} textAlign="center">
                Don't have an account?{" "}
                <Link to="/register">
                  <Text as="span" color="teal.500" textDecoration="underline">
                    Sign up
                  </Text>
                </Link>
              </Text>
            </Box>
          </Stack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default Login;
