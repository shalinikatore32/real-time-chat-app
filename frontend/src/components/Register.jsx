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
  Container,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const toast = useToast();

  const postDetails = (profilePic) => {
    if (profilePic === undefined) {
      toast({
        title: "Profile picture is required",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (profilePic.type === "image/jpeg" || profilePic.type === "image/png") {
      const data = new FormData();

      data.append("file", profilePic);
      data.append("upload_preset", "chatApp");
      data.append("cloud_name", "dclhy2umw");
      fetch("https://api.cloudinary.com/v1_1/dclhy2umw/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setProfilePic(data.url.toString());
          setLoading(false);
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
      return;
    } else {
      toast({
        title: "Invalid file type",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:5000/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log(response);

      if (response.ok === true) {
        const responseData = await response.json();
        console.log(responseData);
        toast({
          title: "Registration successful",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });

        setTimeout(() => {
          setLoading(false);
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      toast({
        title: err.message,
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
              Create an Account
            </Heading>
            <Text fontSize="lg" color="gray.700" textAlign="center">
              Enter your details to get started.
            </Text>

            <Box w="100%" bg="white" p={6} boxShadow="lg" borderRadius="md">
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      id="email"
                      type="email"
                      name="email"
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
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel htmlFor="confirm-password">
                      Confirm Password
                    </FormLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      name="confirm-password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel htmlFor="profile-pic">Profile Picture</FormLabel>
                    <Input
                      id="profile-pic"
                      type="file"
                      name="profile-pic"
                      onChange={(e) => postDetails(e.target.files[0])}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    isLoading={loading}
                    loadingText="Signing up"
                    width="full"
                  >
                    Sign Up
                  </Button>
                </Stack>
              </form>

              <Text fontSize="sm" color="gray.600" mt={4} textAlign="center">
                Already have an account?{" "}
                <Link to="/login">
                  <Text as="span" color="teal.500" textDecoration="underline">
                    Login
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

export default Register;
