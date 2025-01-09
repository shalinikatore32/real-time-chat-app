// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Consumer } from "../store/StoreToken";
// import { toast } from "react-toastify";
// import "../styles/EditUser.css"; // Import CSS file for styling

// function EditUser() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { authorizedToken } = Consumer();
//   const [userData, setUserData] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const resp = await fetch(`http://localhost:5000/api/user/${id}`, {
//           method: "GET",
//           headers: {
//             Authorization: authorizedToken,
//           },
//         });
//         const resp_data = await resp.json();
//         console.log(resp_data);
//         if (resp.ok) {
//           setUserData({
//             name: resp_data.getUser.name,
//             email: resp_data.getUser.email,
//             password: resp_data.getUser.password,
//           });
//         } else {
//           toast.error("Failed to fetch user data");
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     fetchUserData();
//   }, [id, authorizedToken]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserData({ ...userData, [name]: value });
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const resp = await fetch(
//         `http://localhost:5000/api/user/update-pass/${id}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: authorizedToken,
//           },
//           body: JSON.stringify(userData),
//         }
//       );
//       console.log(resp);
//       if (resp.ok) {
//         toast.success("User updated successfully");
//         navigate("/admin/users");
//       } else {
//         toast.error("Failed to update user");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <div className="update-user-container">
//       <h2>Update User</h2>
//       <form onSubmit={handleFormSubmit}>
//         <div className="form-group">
//           <label htmlFor="username">Name:</label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             value={userData.name}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="email">Email:</label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={userData.email}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password">Password:</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={userData.password}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
//         <button type="submit">Update User</button>
//       </form>
//     </div>
//   );
// }

// export default EditUser;

// import  FocusLock from "react-focus-lock"

import React from "react";
import { useDisclosure } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  Input,
  Stack,
  ButtonGroup,
  Button,
  Box,
  IconButton,
} from "@chakra-ui/react";
import FocusLock from "react-focus-lock";

const TextInput = React.forwardRef((props, ref) => {
  return (
    <FormControl>
      <FormLabel htmlFor={props.id}>{props.label}</FormLabel>
      <Input ref={ref} id={props.id} {...props} />
    </FormControl>
  );
});

// 2. Create the form
const Form = ({ firstFieldRef, onCancel }) => {
  return (
    <Stack spacing={4}>
      <TextInput
        label="First name"
        id="first-name"
        ref={firstFieldRef}
        defaultValue="John"
      />
      <TextInput label="Last name" id="last-name" defaultValue="Smith" />
      <ButtonGroup display="flex" justifyContent="flex-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button isDisabled colorScheme="teal">
          Save
        </Button>
      </ButtonGroup>
    </Stack>
  );
};

// 3. Create the Popover
// Ensure you set `closeOnBlur` prop to false so it doesn't close on outside click
const PopoverForm = () => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = React.useRef(null);

  return (
    <>
      <Box display="inline-block" mr={3}>
        John Smith
      </Box>
      <Popover
        isOpen={isOpen}
        initialFocusRef={firstFieldRef}
        onOpen={onOpen}
        onClose={onClose}
        placement="right"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton size="sm" icon={<EditIcon />} />
        </PopoverTrigger>
        <PopoverContent p={5}>
          <FocusLock returnFocus persistentFocus={false}>
            <PopoverArrow />
            <PopoverCloseButton />
            <Form firstFieldRef={firstFieldRef} onCancel={onClose} />
          </FocusLock>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default PopoverForm;
