import React from 'react';
import { Link } from 'react-router-dom';

const SignupForm = () => {
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

      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent brand-text-gradient">Sign Up</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-2">Username:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 px-4 rounded-md transition-colors duration-300 bg-clip-text text-transparent brand-text-gradient border border-primary"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
