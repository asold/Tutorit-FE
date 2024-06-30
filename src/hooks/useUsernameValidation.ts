import { useState, useEffect } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS } from '../common/constants.ts';

const usernameRegex = /^[a-zA-Z0-9]+$/;

const useUsernameValidation = (username: string) => {
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateUsername = async () => {
      if (!username) {
        setIsUsernameValid(false);
        setError(null);
        return;
      }

      if (username.length < 4) {
        setIsUsernameValid(false);
        setError('Username must be at least 4 characters long');
        return;
      }

      if (!usernameRegex.test(username)) {
        setIsUsernameValid(false);
        setError('Username can only contain alphanumeric characters without spaces');
        return;
      }

      setIsChecking(true);
      try {
        const response = await axios.post(`${SERVER_ADDRESS}/tutorit/User/checkUsername`, { username });
        if (response.status === 200) {
          setIsUsernameValid(true);
          setError(null);
        }
      } catch (error: any) {
        if (error.response && error.response.status === 409) {
          setIsUsernameValid(false);
          setError('Username already in use!');
        } else {
          setIsUsernameValid(false);
          setError('Error checking username!');
        }
      } finally {
        setIsChecking(false);
      }
    };

    validateUsername();
  }, [username]);

  return { isUsernameValid, isChecking, error };
};

export default useUsernameValidation;
