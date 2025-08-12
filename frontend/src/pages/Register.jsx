import React from 'react';
import SignupForm from '../components/login/SignupForm';
import { cn } from '../lib/utils'; // Import cn utility

const Register = () => {
  const brandName = "OLFACTIVE ECHO"; // Define brandName

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden isolate">
      {/* Background brand text with guaranteed alternating letters */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none -z-10 overflow-hidden">
        {brandName.split(' ').map((word, index) => (
          <div
            key={index}
            className={cn(
              `absolute left-1/2 -translate-x-1/2 font-bold text-transparent bg-gold-ghost bg-clip-text uppercase tracking-[0.35em]`,
              index === 0 ? "top-[15%] text-brand-lg" : "top-[55%] text-brand-sm"
            )}
          >
            <div className="flex">
              {[...word].map((letter, i) => (
                <span
                  key={i}
                  className={cn(
                    `inline-block transition-all duration-300`,
                    i % 2 === 0 ? 'h-letter-tall translate-y-letter-down' : 'h-letter-short -translate-y-letter-up'
                  )}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card/90 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-border/50">
        <SignupForm />
      </div>
    </div>
  );
};

export default Register;
