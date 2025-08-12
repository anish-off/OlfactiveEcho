import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="bg-gradient-to-r from-primary to-amber-600 py-20 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Join the <span className="text-white">Olfactive Club</span>
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter for exclusive offers, new scent announcements, and behind-the-scenes access to our perfumery.
        </p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Your email address" 
            className="bg-white/90 text-gray-900 placeholder:text-gray-500 border-none h-14 flex-grow rounded-full px-6"
            required
          />
          <Button 
            type="submit" 
            variant="secondary" 
            size="lg"
            className="h-14 px-8 text-lg rounded-full gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            Subscribe
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <p className="text-sm opacity-80 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

export default CallToAction;