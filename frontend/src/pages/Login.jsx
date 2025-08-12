import React from 'react';
import LoginForm from '../components/login/LoginForm';

const Login = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-[10rem] font-bold bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800] bg-clip-text text-transparent opacity-20 select-none uppercase leading-none">Olfactive</h1>
        <h1 className="text-[8rem] font-bold bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800] bg-clip-text text-transparent opacity-20 select-none uppercase leading-none">Echo</h1>
      </div>
      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
