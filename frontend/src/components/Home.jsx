import React from "react";
import {
  ChakraProvider,
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Container,
  useBreakpointValue,
  Image,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Home = () => {
  const headingSize = useBreakpointValue({ base: "2xl", md: "4xl" });
  const textSize = useBreakpointValue({ base: "md", md: "lg" });

  return (
    <ChakraProvider>
      <Box
        bgGradient="linear(to-r, teal.500, blue.400)"
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        color="white"
        textAlign="center"
        px={4}
      >
        <Container maxW="container.md" centerContent>
          <Stack spacing={8} align="center">
            <Heading as="h1" size={headingSize}>
              Connect Anytime, Anywhere
            </Heading>
            <Text fontSize={textSize}>
              A seamless way to stay connected with your friends, family, and
              teams. Start your journey with us now!
            </Text>
            <Stack
              direction={{ base: "column", sm: "row" }}
              spacing={6}
              justify="center"
            >
              <Link to="/register">
                <Button
                  size="lg"
                  px={8}
                  py={6}
                  colorScheme="whiteAlpha"
                  bg="white"
                  color="teal.500"
                  _hover={{ bg: "teal.600", color: "white" }}
                >
                  Sign Up
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  px={8}
                  py={6}
                  colorScheme="whiteAlpha"
                  border="2px"
                  borderColor="white"
                  bg="transparent"
                  _hover={{ bg: "white", color: "teal.500" }}
                >
                  Login
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default Home;
