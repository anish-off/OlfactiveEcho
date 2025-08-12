// Signup.jsx
import React from 'react';
import SignupForm from '../components/login/SignupForm';
import { cn } from '../utils';

const Signup = () => {
  const companyName = "OLFACTIVE ECHO";
  
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Stylized background text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="relative w-full h-full overflow-hidden">
          {companyName.split(' ').map((word, wordIndex) => (
            <div 
              key={wordIndex}
              className={cn(
                "absolute left-1/2 -translate-x-1/2 font-bold bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800] bg-clip-text text-transparent opacity-10 uppercase leading-none",
                wordIndex === 0 ? "top-[20%] text-[20rem]" : "top-[50%] text-[16rem]"
              )}
            >
              {word.split('').map((letter, letterIndex) => (
                <span 
                  key={letterIndex}
                  className={cn(
                    "inline-block",
                    letterIndex % 2 === 0 ? "h-[0.8em]" : "h-[0.6em]",
                    "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  )}
                  style={{
                    transform: letterIndex % 2 === 0 ? 'translateY(0.1em)' : 'translateY(-0.05em)'
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 w-full">
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;