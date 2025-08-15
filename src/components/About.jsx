/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { Download, ExternalLink, Zap } from 'lucide-react';
import { motion, useAnimation, useInView } from "framer-motion";
import profileImage from '../assets/images/abel.jpg';

// ProfileCard Component
const DEFAULT_BEHIND_GRADIENT =
  "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(0,0%,90%,var(--card-opacity)) 4%,hsla(0,0%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(0,0%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(0,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#ffffff44 0%,#00000000 100%),radial-gradient(100% 100% at 50% 50%,#ffffff66 1%,#00000000 76%),conic-gradient(from 124deg at 50% 50%,#ffffff77 0%,#cccccc77 40%,#cccccc77 60%,#ffffff77 100%)";

const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg,#2a2a2a8c 0%,#40404044 100%)";

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
};

// Enhanced animation variants with more reliable triggers
const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 80,
    scale: 0.9,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.9, 
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  }
};

const fadeInLeft = {
  hidden: { 
    opacity: 0, 
    x: -80,
    scale: 0.9,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.9, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.2
    }
  }
};

const fadeInRight = {
  hidden: { 
    opacity: 0, 
    x: 80,
    scale: 0.9,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.9, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.3
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const round = (value, precision = 3) =>
  parseFloat(value.toFixed(precision));

const adjust = (
  value,
  fromMin,
  fromMax,
  toMin,
  toMax
) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

const easeInOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const ProfileCardComponent = ({
  avatarUrl =  {profileImage},
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = "",
  enableTilt = true,
  name = "Ibrahim Ali Abel",
  title = "Mobile Developer",
  handle = "bellz",
  status = "Online",
  contactText = "Contact Me",
  showUserInfo = true,
  onContactClick,
}) => {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);

  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null;

    let rafId = null;

    const updateCardTransform = (
      offsetX,
      offsetY,
      card,
      wrap
    ) => {
      const width = card.clientWidth;
      const height = card.clientHeight;

      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5))}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      };

      Object.entries(properties).forEach(([property, value]) => {
        wrap.style.setProperty(property, value);
      });
    };

    const createSmoothAnimation = (
      duration,
      startX,
      startY,
      card,
      wrap
    ) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;

      const animationLoop = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = clamp(elapsed / duration);
        const easedProgress = easeInOutCubic(progress);

        const currentX = adjust(easedProgress, 0, 1, startX, targetX);
        const currentY = adjust(easedProgress, 0, 1, startY, targetY);

        updateCardTransform(currentX, currentY, card, wrap);

        if (progress < 1) {
          rafId = requestAnimationFrame(animationLoop);
        }
      };

      rafId = requestAnimationFrame(animationLoop);
    };

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
    };
  }, [enableTilt]);

  const handlePointerMove = useCallback(
    (event) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      const rect = card.getBoundingClientRect();
      animationHandlers.updateCardTransform(
        event.clientX - rect.left,
        event.clientY - rect.top,
        card,
        wrap
      );
    },
    [animationHandlers]
  );

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;

    if (!card || !wrap || !animationHandlers) return;

    animationHandlers.cancelAnimation();
    wrap.classList.add("active");
    card.classList.add("active");
  }, [animationHandlers]);

  const handlePointerLeave = useCallback(
    (event) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      animationHandlers.createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        event.offsetX,
        event.offsetY,
        card,
        wrap
      );
      wrap.classList.remove("active");
      card.classList.remove("active");
    },
    [animationHandlers]
  );

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return;

    const card = cardRef.current;
    const wrap = wrapRef.current;

    if (!card || !wrap) return;

    const pointerMoveHandler = handlePointerMove;
    const pointerEnterHandler = handlePointerEnter;
    const pointerLeaveHandler = handlePointerLeave;

    card.addEventListener("pointerenter", pointerEnterHandler);
    card.addEventListener("pointermove", pointerMoveHandler);
    card.addEventListener("pointerleave", pointerLeaveHandler);

    const initialX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;

    animationHandlers.updateCardTransform(initialX, initialY, card, wrap);
    animationHandlers.createSmoothAnimation(
      ANIMATION_CONFIG.INITIAL_DURATION,
      initialX,
      initialY,
      card,
      wrap
    );

    return () => {
      card.removeEventListener("pointerenter", pointerEnterHandler);
      card.removeEventListener("pointermove", pointerMoveHandler);
      card.removeEventListener("pointerleave", pointerLeaveHandler);
      animationHandlers.cancelAnimation();
    };
  }, [
    enableTilt,
    animationHandlers,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
  ]);

  const cardStyle = useMemo(
    () => ({
      "--behind-gradient": showBehindGradient
        ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT)
        : "none",
      "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
      "--card-opacity": "0.8",
    }),
    [showBehindGradient, behindGradient, innerGradient]
  );

  const handleContactClick = useCallback(() => {
    onContactClick?.();
  }, [onContactClick]);

  return (
    <div
      ref={wrapRef}
      className={`relative perspective-[1000px] ${className}`.trim()}
      style={{
        width: '320px',
        height: '480px',
        ...cardStyle
      }}
    >
      <section 
        ref={cardRef} 
        className="relative w-full h-full cursor-pointer transition-transform duration-300 ease-out"
        style={{
          transform: 'rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background gradient layer */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-90"
          style={{
            background: 'var(--behind-gradient)',
            filter: 'blur(1px)',
            transform: 'translateZ(-10px)',
          }}
        />
        
        {/* Main card */}
        <div 
          className="relative w-full h-full rounded-3xl border border-gray-500/50 backdrop-blur-md overflow-hidden bg-gradient-to-b from-gray-900/90 to-black/95"
        >
          {/* Shine effect */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at var(--pointer-x, 50%) var(--pointer-y, 50%), 
                           rgba(255,255,255,0.4) 0%, 
                           rgba(255,255,255,0.1) 20%, 
                           transparent 50%)`,
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col items-center">
            {/* Header with name and title */}
            <div className="text-center mb-8 mt-4">
              <h3 className="text-3xl font-light text-white mb-2">{name}</h3>
              <p className="text-lg text-gray-300">{title}</p>
            </div>
            
            {/* Avatar - centered and larger */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <img
                className="w-48 h-48 object-cover rounded-full border-2 border-white/20"
                src={avatarUrl}
                alt={`${name} avatar`}
                loading="lazy"
                style={{
                  filter: 'brightness(1.1) contrast(1.05) grayscale(0.2)',
                }}
              />
            </div>
            
            {/* Bottom section with user info */}
            {showUserInfo && (
              <div className="w-full">
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        className="w-8 h-8 object-cover rounded-full border border-white/20"
                        src={avatarUrl}
                        alt={`${name} mini avatar`}
                        loading="lazy"
                        style={{ filter: 'grayscale(0.2)' }}
                      />
                      <div>
                        <div className="text-white font-medium text-sm">@{handle}</div>
                        <div className="text-gray-300 text-xs">{status}</div>
                      </div>
                    </div>
                    
                    <button
                      className="bg-gray-700/70 hover:bg-gray-600/70 rounded-lg px-4 py-2 text-white text-sm font-medium transition-all duration-200"
                      onClick={handleContactClick}
                      type="button"
                    >
                      {contactText}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);

// Custom hook for reliable scroll detection
const useScrollAnimation = (threshold = 0.2) => {
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, { 
    threshold: threshold,
    once: false,
    margin: "-100px 0px"
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return { ref, controls, inView };
};

// Main About Component
const About = () => {
  // Use custom scroll animation hooks for each section
  const headerAnimation = useScrollAnimation(0.1);
  const contentAnimation = useScrollAnimation(0.2);
  const cardAnimation = useScrollAnimation(0.2);

  // Function to handle CV download
  const handleDownloadCV = () => {
    window.open('https://drive.google.com/drive/folders/1pUwnbGXDvZVzfdSbT8J9Dbx5a70qyBF8?usp=drive_link', '_blank');
  };

  return (
    <div id="about" className="min-h-screen bg-gradient-to-br from-black via-gray-900/30 to-black px-8 md:px-16 py-16 lg:py-24 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Enhanced AOS */}
        <motion.div 
          ref={headerAnimation.ref}
          className="text-center mb-16"
          initial="hidden"
          animate={headerAnimation.controls}
          variants={fadeInUp}
        >
          <motion.h1 
            className="text-7xl lg:text-8xl font-bold mb-4"
            variants={fadeInUp}
          >
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
              About Me
            </span>
          </motion.h1>
          <motion.div 
            className="flex items-center justify-center space-x-2 text-gray-300 text-lg"
            variants={fadeInUp}
          >
            <span>✨</span>
            <span>Passionate about building intuitive and impactful mobile apps.</span>
            <span>✨</span>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content with Enhanced AOS */}
          <motion.div 
            ref={contentAnimation.ref}
            className="space-y-8"
            initial="hidden"
            animate={contentAnimation.controls}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInLeft}>
              <motion.h2 
                className="text-4xl lg:text-5xl font-bold text-white mb-6"
                variants={fadeInLeft}
              >
                Hello, I'm<br />
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Ibrahim Ali Abel
                </span>
              </motion.h2>
              
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed mb-8"
                variants={fadeInLeft}
              >
                An Informatics student with a strong interest in mobile application development. 
                I focus on creating intuitive and functional digital solutions, and always strive 
                to deliver the best user experience in every project I work on.
              </motion.p>

              {/* Quote with Enhanced AOS */}
              <motion.div 
                className="bg-gradient-to-r from-gray-900/40 to-black/40 border border-gray-600/40 rounded-2xl p-6 mb-8 backdrop-blur-sm w-fit"
                variants={fadeInLeft}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <p className="text-gray-200 italic text-lg flex items-center whitespace-nowrap">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Zap className="w-5 h-5 mr-2 flex-shrink-0" />
                  </motion.div>
                  "AI as the brush, humans as the artist."
                </p>
              </motion.div>

              {/* Download CV Button - Single Button */}
              <motion.div 
                className="flex justify-center sm:justify-start"
                variants={fadeInLeft}
              >
                <motion.button 
                  onClick={handleDownloadCV}
                  className="flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-200 rounded-full text-black font-semibold transition-all hover:scale-105 shadow-lg shadow-white/25"
                  variants={fadeInLeft}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(255, 255, 255, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Download className="w-5 h-5 mr-2" />
                  </motion.div>
                  Get My Resume
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side - ProfileCard Component with Enhanced AOS */}
          <motion.div 
            ref={cardAnimation.ref}
            className="flex justify-center lg:justify-end"
            initial="hidden"
            animate={cardAnimation.controls}
            variants={fadeInRight}
          >
            <motion.div 
              className="w-80 h-96 lg:w-96 lg:h-[500px] relative flex items-center justify-center"
              variants={fadeInRight}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <ProfileCard 
                name="Ibrahim Ali Abel"
                title="Mobile Developer"
                handle="bellz"
                status="Online"
                contactText="Contact Me"
                avatarUrl={profileImage}
                showUserInfo={true}
                enableTilt={true}
                onContactClick={() => console.log('Contact clicked!')}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced floating elements for visual enhancement */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating orbs with better animations */}
          <motion.div
            className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full blur-sm"
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-3 h-3 bg-gray-400/30 rounded-full blur-sm"
            animate={{
              y: [0, 20, 0],
              x: [0, -12, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />
          <motion.div
            className="absolute bottom-32 left-20 w-2 h-2 bg-white/40 rounded-full blur-sm"
            animate={{
              y: [0, -15, 0],
              x: [0, 8, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
          
          {/* Additional floating particles for more dynamic effect */}
          <motion.div
            className="absolute top-1/3 left-1/4 w-1 h-1 bg-gray-300/50 rounded-full blur-sm"
            animate={{
              y: [0, -25, 0],
              x: [0, 20, 0],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white/40 rounded-full blur-sm"
            animate={{
              y: [0, 18, 0],
              x: [0, -15, 0],
              opacity: [0.2, 0.6, 0.2],
              rotate: [360, 0, 360],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default About;