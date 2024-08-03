import React, { useEffect, useState } from 'react';
import { MenuItem, Select, FormControl, InputLabel, CircularProgress, Box, Typography } from '@mui/material';
import { green, grey } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SERVER_ADDRESS } from '../../common/constants.ts'; // Ensure this is correct
import { useDispatch } from 'react-redux';
import { setCallPartnerUsername } from '../../actions/videoActions/videoActions.ts';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { SelectChangeEvent } from '@mui/material/Select';

interface UserStatus {
  id: string;
  username: string;
  online: boolean;
}

interface UserStatusDropdownProps {
  token: string;
}

const UserStatusDropdown: React.FC<UserStatusDropdownProps> = ({ token }) => {
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUsername, setSelectedUsername] = useState<string>(''); // State to track selected username

  useEffect(() => {
    const fetchUserStatuses = async () => {
      const encodedToken = encodeURIComponent(token);

      try {
        const response = await fetch(`${SERVER_ADDRESS}/tutorit/User/user_status?token=${encodedToken}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching user statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatuses();
  }, [token]);

  const handleChange = (event: SelectChangeEvent) => {
    const selectedUsername = event.target.value as string;
    setSelectedUsername(selectedUsername); // Update the selected username state
    dispatch(setCallPartnerUsername(selectedUsername)); // Dispatch action to Redux
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="user-status-label">Online Users</InputLabel>
      <Select
        labelId="user-status-label"
        id="user-status-select"
        value={selectedUsername} // Set the value to the selected username state
        label="Online Users"
        onChange={handleChange}
      >
        {users.map(user => (
          <MenuItem key={user.id} value={user.username}>
            <Box display="flex" alignItems="center">
              <Typography>{user.username}</Typography>
              <CheckCircleIcon
                sx={{
                  color: user.online ? green[500] : grey[500],
                  ml: 1
                }}
                titleAccess={user.online ? 'Online' : 'Offline'}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default UserStatusDropdown;
