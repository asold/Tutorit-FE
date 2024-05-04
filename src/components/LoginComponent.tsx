import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { login } from '../actions/loginActions/loginAction.ts';
import { useNavigate } from 'react-router-dom';
import { LoginState } from '../types/loginTypes.ts';



const LoginComponent: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);

  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();

  const navigate = useNavigate();
  const token = useSelector((state: LoginState) => state.token);

  useEffect(() => {
      // console.log("Token: ", token);
      // if (token) {
        // navigate('/video');
      // } else {
        // console.log("Login failed");
    // }
   }, [navigate, token]); // Include navigate in the dependency array if neede

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      dispatch(login(username, password, () => {
          navigate('/video');
      }));

    };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginComponent;
