import React, { useState } from "react";
import { Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../actions/registration/registrationActions.ts";
import { useNavigate } from "react-router-dom";

const UserRegistration: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [role, setRole] = useState('');

  const personalInfo = useSelector((state: any) => state.registration.user);


  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
  const navigate = useNavigate();



  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole((event.target as HTMLInputElement).value);
  };

  const isFormComplete = username && password && repeatPassword && role && password === repeatPassword;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box display="flex" flexDirection="column" alignItems="center" p={2} border="1px solid #ccc" borderRadius="8px">
        <Typography variant="h2" gutterBottom>
          Register
        </Typography>
        <form>
          <Box display="flex" flexDirection="column" alignItems="center" mb={1} width="100%">
            <Box mb={1} width="300px">
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Box>
            <Box mb={1} width="300px">
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>
            <Box mb={1} width="300px">
              <TextField
                label="Repeat Password"
                variant="outlined"
                type="password"
                fullWidth
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                error={repeatPassword !== password}
                helperText={repeatPassword !== password ? 'Passwords do not match' : ''}
              />
            </Box>
            <Box mb={1} display="flex" flexDirection="column" alignItems="center" width="300px">
              <FormControl component="fieldset">
                <Typography variant="h6" gutterBottom textAlign="center">
                  Role
                </Typography>
                <RadioGroup value={role} onChange={handleRoleChange}>
                  <FormControlLabel value="1" control={<Radio />} label="Student" />
                  <FormControlLabel value='0' control={<Radio />} label="Teacher" />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
          <Box mt={2} textAlign="center">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!isFormComplete}


              onClick={() => {
                dispatch(registerUser(username, password, role, personalInfo, () => {
                  navigate('/user-creation');
                }));
              }}

            >
              Register
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UserRegistration;
