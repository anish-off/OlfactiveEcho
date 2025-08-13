import React, { useEffect } from 'react';
import LoginForm from '../components/login/LoginForm';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const brandName = "OLFACTIVE ECHO";

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/products');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden isolate">
      {/* Background brand text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none -z-10 overflow-hidden">
        {brandName.split(' ').map((word, index) => (
          <div
            key={index}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 font-bold text-white uppercase tracking-[0.35em]",
              index === 0 ? "top-brand-top text-brand-sm" : "top-brand-bottom text-brand-lg"
            )}
          >
            <div className="relative">
              {/* Gold gradient background */}
              <div className={cn(
                "absolute inset-0 bg-brand-text-gradient opacity-20 rounded-full",
                index === 0 ? "blur-[40px] -m-8" : "blur-[60px] -m-12"
              )} />
              {/* Text container */}
              <div className="flex relative">
                {[...word].map((letter, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-block transition-all duration-500 ease-custom-ease",
                      i % 2 === 0 ? 'h-letter-tall translate-y-letter-down' : 'h-letter-short -translate-y-letter-up'
                    )}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card/90 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-border/50">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;