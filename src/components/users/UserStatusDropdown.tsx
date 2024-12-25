import React, { useEffect, useState, useRef } from 'react';
import {
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
  Typography,
  ClickAwayListener,
  Popper,
  Paper,
  MenuList,
} from '@mui/material';
import { green, grey } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SERVER_ADDRESS } from '../../common/constants.ts';

interface UserStatus {
  id: string;
  username: string;
  online: boolean;
}

interface UserStatusDropdownProps {
  token: string | null;
  onUsernameSelect: (username: string) => void;
}

const UserStatusDropdown: React.FC<UserStatusDropdownProps> = ({ token, onUsernameSelect }) => {
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUsername, setSelectedUsername] = useState<string>(''); // Local state to track dropdown
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const anchorRef = useRef<HTMLDivElement>(null);

  /**
   * Fetch user statuses on mount
   */
  useEffect(() => {
    const fetchUserStatuses = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(`${SERVER_ADDRESS}/tutorit/User/user_status?token=${encodedToken}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  /**
   * Handle dropdown selection
   */
  const handleSelect = (username: string) => {
    setSelectedUsername(username);
    onUsernameSelect(username);
    setIsOpen(false); // Close dropdown after selection
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setIsOpen(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
      <FormControl fullWidth>
        {/* <InputLabel id="user-status-label">Online Users</InputLabel> */}
        <Box
          ref={anchorRef}
          onClick={handleToggle}
          onTouchStart={handleToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: 'white',
          }}
        >
          <Typography>
            {selectedUsername || 'Select a user'}
          </Typography>
          <ArrowDropDownIcon />
        </Box>
      </FormControl>

      {/* Custom Dropdown */}
      <Popper
        open={isOpen}
        anchorEl={anchorRef.current}
        placement="right-start"
        modifiers={[
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['left', 'right'],
            },
          },
        ]}
        sx={{
          zIndex: 1300,
          maxHeight: '200px',
          overflowY: 'auto',
        }}
      >
        <Paper>
          <ClickAwayListener onTouchStart={handleClose} onClickAway={handleClose}>
            <MenuList>
              {users.length > 0 ? (
                users.map((user) => (
                  <MenuItem
                    key={user.id}
                    onClick={() => handleSelect(user.username)}
                    onTouchStart={() => handleSelect(user.username)}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography>{user.username}</Typography>
                      <CheckCircleIcon
                        sx={{
                          color: user.online ? green[500] : grey[500],
                          ml: 1,
                        }}
                        titleAccess={user.online ? 'Online' : 'Offline'}
                      />
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No users available</MenuItem>
              )}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </Box>
  );
};

export default UserStatusDropdown;
