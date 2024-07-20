import { useState, useEffect } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS } from '../common/constants.ts';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const useEmailValidation = (email: string) => {
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateEmail = async () => {
      if (!email) {
        setIsEmailValid(false);
        setError(null);
        return;
      }

      if (!emailRegex.test(email)) {
        setIsEmailValid(false);
        setError('Invalid email format');
        return;
      }

      setIsChecking(true);
      try {
        const response = await axios.post(`${SERVER_ADDRESS}/tutorit/User/checkEmail`, { email });
        if (response.status === 200) {
          setIsEmailValid(true);
          setError(null);
        }
      } catch (error: any) {
        if (error.response && error.response.status === 409) {
          setIsEmailValid(false);
          setError('Email already in use!');
        } else {
          setIsEmailValid(false);
          setError('Error checking email!');
        }
      } finally {
        setIsChecking(false);
      }
    };

    validateEmail();
  }, [email]);

  return { isEmailValid, isChecking, error };
};

export default useEmailValidation;
