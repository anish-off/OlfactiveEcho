import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Star, Gift, Zap, Timer } from 'lucide-react';

const DiscountBanner = ({ 
  title = "Great Fragrance Festival", 
  subtitle = "Upto 70% OFF + Extra 10% OFF", 
  endDate,
  theme = "sale",
  compact = false 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!endDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const saleEnd = new Date(endDate).getTime();
      const distance = saleEnd - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const themeStyles = {
    sale: "bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800]",
    premium: "bg-gradient-to-r from-[#a06800] via-[#8b5a00] to-[#704a00]",
    seasonal: "bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#9d7100]",
    flash: "bg-gradient-to-r from-[#d4af37] via-[#c69a2d] to-[#b8860b]"
  };

  const icons = {
    sale: Flame,
    premium: Star,
    seasonal: Gift,
    flash: Zap
  };

  const Icon = icons[theme] || Flame;

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${themeStyles[theme]} text-white shadow-2xl mb-8`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')"
        }} />
      </div>

      {/* Animated Elements */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Icon className="h-8 w-8 opacity-20" />
        </motion.div>
      </div>

      <div className={`relative ${compact ? 'px-4 py-4 md:px-8 md:py-6' : 'px-6 py-8 md:px-12 md:py-12'}`}>
        <div className={`flex ${compact ? 'flex-row' : 'flex-col md:flex-row'} items-center justify-between`}>
          {/* Left Section */}
          <div className={`${compact ? 'text-left' : 'text-center md:text-left'} ${compact ? 'mb-0' : 'mb-6 md:mb-0'}`}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`flex items-center ${compact ? 'justify-start' : 'justify-center md:justify-start'} gap-3 ${compact ? 'mb-2' : 'mb-4'}`}
            >
              <Icon className={`${compact ? 'h-6 w-6' : 'h-10 w-10'}`} />
              <div>
                <h1 className={`${compact ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} font-bold`}>{title}</h1>
                {!compact && <p className="text-lg md:text-xl opacity-90">{subtitle}</p>}
              </div>
            </motion.div>

            {!compact && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-2 justify-center md:justify-start"
              >
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  Free Shipping Above ₹999
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  Sample Available
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  Easy Returns
                </span>
              </motion.div>
            )}

            {compact && (
              <p className="text-sm md:text-base opacity-90">{subtitle}</p>
            )}
          </div>

          {/* Right Section - Timer */}
          {endDate && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-3'}`}>
                <Timer className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
                <span className={`${compact ? 'text-sm' : 'text-lg'} font-semibold`}>Sale Ends In:</span>
              </div>
              <div className={`flex gap-${compact ? '2' : '3'}`}>
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Min', value: timeLeft.minutes },
                  { label: 'Sec', value: timeLeft.seconds }
                ].map(({ label, value }) => (
                  <div key={label} className={`bg-white/20 backdrop-blur-sm rounded-lg ${compact ? 'p-2 min-w-[50px]' : 'p-3 min-w-[60px]'}`}>
                    <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold`}>{value.toString().padStart(2, '0')}</div>
                    <div className={`${compact ? 'text-xs' : 'text-xs'} opacity-75`}>{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-white/10">
        <motion.div
          className="h-full bg-white/20"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

export default DiscountBanner;