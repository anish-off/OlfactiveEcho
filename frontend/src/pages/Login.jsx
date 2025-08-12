import React from 'react';
import LoginForm from '../components/login/LoginForm';

const Login = () => {
  const brandName = "OLFACTIVE ECHO";
  
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden isolate">
      {/* Background brand text with guaranteed alternating letters */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none -z-10 overflow-hidden">
        {brandName.split(' ').map((word, index) => (
          <div 
            key={index}
            className={`absolute left-1/2 -translate-x-1/2 font-bold text-foreground uppercase tracking-tight ${
              index === 0 ? "top-[15%] text-brand-sm" : "top-[55%] text-brand-lg"
            }`}
          >
            <div className="flex">
              {[...word].map((letter, i) => (
                <span 
                  key={i}
                  className={`
                    inline-block transition-all duration-300
                    ${i % 2 === 0 ? 'h-letter-tall translate-y-letter-down' : 'h-letter-short -translate-y-letter-up'}
                  `}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card/90 p-8 rounded-xl shadow-xl border border-border/50">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;