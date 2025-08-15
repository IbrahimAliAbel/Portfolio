/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useCallback, useMemo, useState, createElement, memo } from 'react';
import { Github, Linkedin, Instagram, ExternalLink, Mail, Settings, Download, Cloud, Sparkles } from 'lucide-react';

// TextType Component
const TextType = ({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  const textArray = Array.isArray(text) ? text : [text];

  const getRandomSpeed = () => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  };

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return "#ffffff";
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      // Simple cursor blink animation without GSAP
      const blinkInterval = setInterval(() => {
        if (cursorRef.current) {
          cursorRef.current.style.opacity = 
            cursorRef.current.style.opacity === '0' ? '1' : '0';
        }
      }, cursorBlinkDuration * 1000);

      return () => clearInterval(blinkInterval);
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return;

    let timeout;

    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) {
            return;
          }

          if (onSentenceComplete) {
            onSentenceComplete(textArray[currentTextIndex], currentTextIndex);
          }

          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => { }, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          timeout = setTimeout(
            () => {
              setDisplayedText(
                (prev) => prev + processedText[currentCharIndex]
              );
              setCurrentCharIndex((prev) => prev + 1);
            },
            variableSpeed ? getRandomSpeed() : typingSpeed
          );
        } else if (textArray.length > 1) {
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...props,
    },
    React.createElement('span', { 
      className: "inline", 
      style: { color: getCurrentTextColor() } 
    }, displayedText),
    showCursor && React.createElement('span', {
      ref: cursorRef,
      className: `ml-1 inline-block opacity-100 ${shouldHideCursor ? "hidden" : ""} ${cursorClassName}`
    }, cursorCharacter)
  );
};

// Memoized Components
const StatusBadge = memo(() => (
  <div className="inline-flex items-center px-4 py-2 bg-gray-800/20 border border-gray-600/40 rounded-full text-gray-300 text-sm backdrop-blur-sm" data-aos="zoom-in" data-aos-delay="800">
    <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
    Turning Ideas into Apps
  </div>
));

const MainTitle = memo(() => (
  <div className="space-y-2" data-aos="fade-up" data-aos-delay="1200">
    <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight">
      Mobile
    </h1>
    <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
      Developer
    </h1>
  </div>
));

const TechStack = memo(({ tech, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    <div className="cursor-target px-5 py-2 rounded-full bg-gray-800/40 border border-gray-600/50 text-sm text-gray-200 backdrop-blur-sm hover:bg-gray-700/40 transition-colors">
      {tech}
    </div>
  </a>
));

const CTAButton = memo(({ href, text, icon: Icon }) => (
  <a href={href}>
    <button className="cursor-target flex items-center justify-center px-8 py-3 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/50 rounded-full text-white font-medium transition-all hover:scale-105 backdrop-blur-sm">
      <Icon className="w-4 h-4 mr-2" />
      {text}
    </button>
  </a>
));

const SocialLink = memo(({ icon: Icon, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    <button className="cursor-target p-3 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 rounded-full text-gray-300 hover:text-white transition-all backdrop-blur-sm hover:scale-110">
      <Icon className="w-5 h-5" />
    </button>
  </a>
));

// TargetCursor Component - Limited to home section only
const TargetCursor = ({
  targetSelector = ".cursor-target",
  scopeSelector = "#home",
  excludeSelectors = ["nav", "header", ".navbar", ".nav"], // Elements to exclude
  spinDuration = 2,
  hideDefaultCursor = true,
  isActive = true,
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const dotRef = useRef(null);
  const scopeElement = useRef(null);
  
  const constants = useMemo(
    () => ({
      borderWidth: 3,
      cornerSize: 12,
      parallaxStrength: 0.00005,
    }),
    []
  );

  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  // Check if cursor is within the home section and not in excluded elements
  const isWithinScope = useCallback((x, y) => {
    if (!scopeElement.current) return false;
    
    // Check if we're in the home section bounds
    const rect = scopeElement.current.getBoundingClientRect();
    const inHomeBounds = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    
    if (!inHomeBounds) return false;
    
    // Check if we're hovering over excluded elements
    const elementAtPoint = document.elementFromPoint(x, y);
    if (!elementAtPoint) return false;
    
    // Check if the element or any of its parents match excluded selectors
    for (const selector of excludeSelectors) {
      if (elementAtPoint.closest(selector)) {
        return false;
      }
    }
    
    return true;
  }, [excludeSelectors]);

  useEffect(() => {
    if (!cursorRef.current) return;

    // Get the scope element (home section)
    scopeElement.current = document.querySelector(scopeSelector);
    if (!scopeElement.current) return;

    const originalCursor = document.body.style.cursor;
    
    if (!isActive) {
      document.body.style.cursor = originalCursor;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
      return;
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll(".target-cursor-corner");

    let activeTarget = null;
    let currentTargetMove = null;
    let currentLeaveHandler = null;
    let isInScope = false;

    const cleanupTarget = (target) => {
      if (currentTargetMove) {
        target.removeEventListener("mousemove", currentTargetMove);
      }
      if (currentLeaveHandler) {
        target.removeEventListener("mouseleave", currentLeaveHandler);
      }
      currentTargetMove = null;
      currentLeaveHandler = null;
    };

    cursor.style.transform = `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px)`;

    const moveHandler = (e) => {
      const withinScope = isWithinScope(e.clientX, e.clientY);
      
      if (withinScope) {
        if (!isInScope) {
          // Entering scope - show custom cursor
          if (hideDefaultCursor) {
            document.body.style.cursor = 'none';
          }
          cursor.style.opacity = '1';
          isInScope = true;
        }
        moveCursor(e.clientX, e.clientY);
      } else {
        if (isInScope) {
          // Leaving scope - hide custom cursor and reset
          document.body.style.cursor = originalCursor;
          cursor.style.opacity = '0';
          isInScope = false;
          
          // Clean up any active target
          if (activeTarget) {
            cleanupTarget(activeTarget);
            activeTarget = null;
            
            // Reset corners to default position
            if (cornersRef.current) {
              const corners = Array.from(cornersRef.current);
              const { cornerSize } = constants;
              const positions = [
                { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: cornerSize * 0.5 },
                { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
              ];

              corners.forEach((corner, index) => {
                corner.style.transform = `translate(${positions[index].x}px, ${positions[index].y}px)`;
              });
            }
          }
        }
      }
    };

    const enterHandler = (e) => {
      // Only work if we're within the scope and not in excluded elements
      if (!isWithinScope(e.clientX, e.clientY)) return;
      
      const directTarget = e.target;

      // Double check - make sure target is not in excluded elements
      for (const selector of excludeSelectors) {
        if (directTarget.closest(selector)) {
          return;
        }
      }

      // Check if the target is within the scope element
      if (!scopeElement.current.contains(directTarget)) return;

      const allTargets = [];
      let current = directTarget;
      while (current && current !== scopeElement.current) {
        if (current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }

      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;

      if (activeTarget === target) return;

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      activeTarget = target;

      const updateCorners = () => {
        const rect = target.getBoundingClientRect();
        const cursorRect = cursorRef.current.getBoundingClientRect();

        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        const [tlc, trc, brc, blc] = Array.from(cornersRef.current);

        const { borderWidth, cornerSize } = constants;

        const offsets = [
          {
            x: rect.left - cursorCenterX - borderWidth,
            y: rect.top - cursorCenterY - borderWidth,
          },
          {
            x: rect.right - cursorCenterX + borderWidth - cornerSize,
            y: rect.top - cursorCenterY - borderWidth,
          },
          {
            x: rect.right - cursorCenterX + borderWidth - cornerSize,
            y: rect.bottom - cursorCenterY + borderWidth - cornerSize,
          },
          {
            x: rect.left - cursorCenterX - borderWidth,
            y: rect.bottom - cursorCenterY + borderWidth - cornerSize,
          },
        ];

        const corners = [tlc, trc, brc, blc];
        corners.forEach((corner, index) => {
          corner.style.transform = `translate(${offsets[index].x}px, ${offsets[index].y}px)`;
        });
      };

      updateCorners();

      const targetMove = () => updateCorners();

      const leaveHandler = () => {
        activeTarget = null;

        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
          ];

          corners.forEach((corner, index) => {
            corner.style.transform = `translate(${positions[index].x}px, ${positions[index].y}px)`;
          });
        }

        cleanupTarget(target);
      };

      currentTargetMove = targetMove;
      currentLeaveHandler = leaveHandler;

      target.addEventListener("mousemove", targetMove);
      target.addEventListener("mouseleave", leaveHandler);
    };

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseover", enterHandler, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseover", enterHandler);

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, scopeSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isActive, isWithinScope, excludeSelectors]);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-0 h-0 pointer-events-none z-[9999] mix-blend-difference transform -translate-x-1/2 -translate-y-1/2"
      style={{ willChange: 'transform', opacity: 0 }}
    >
      <div
        ref={dotRef}
        className="absolute left-1/2 top-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      />
      <div
        className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white transform -translate-x-[150%] -translate-y-[150%] border-r-0 border-b-0"
        style={{ willChange: 'transform' }}
      />
      <div
        className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white transform translate-x-1/2 -translate-y-[150%] border-l-0 border-b-0"
        style={{ willChange: 'transform' }}
      />
      <div
        className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white transform translate-x-1/2 translate-y-1/2 border-l-0 border-t-0"
        style={{ willChange: 'transform' }}
      />
      <div
        className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white transform -translate-x-[150%] translate-y-1/2 border-r-0 border-t-0"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};

// Constants
const TECH_STACK = [
  { name: "Kotlin", link: "https://kotlinlang.org/" },
  { name: "Javascript", link: "https://www.javascript.com/" },
  { name: "Node.js", link: "https://nodejs.org/id" },
  { name: "React", link: "https://react.dev/" }
];
const SOCIAL_LINKS = [
  { icon: Github, link: "https://github.com/IbrahimAliAbel" },
  { icon: Linkedin, link: "https://www.linkedin.com/in/ibrahim-ali-abel-24a20a248/" },
  { icon: Instagram, link: "https://www.instagram.com/abllz_/" }
];

// Main Home Component
const Home = () => {
  const [isHomeSection, setIsHomeSection] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        const rect = homeSection.getBoundingClientRect();
        const isInView = rect.top <= 100 && rect.bottom >= 100;
        setIsHomeSection(isInView);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize AOS-like animations
  useEffect(() => {
    setIsLoaded(true);
    
    // Simple AOS-like animation system
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-aos-delay') || 0;
          const animation = entry.target.getAttribute('data-aos') || 'fade-up';
          
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, parseInt(delay));
        }
      });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <TargetCursor 
        targetSelector=".cursor-target" 
        scopeSelector="#home"
        excludeSelectors={["nav", "header", ".navbar", ".nav", ".navigation"]}
        spinDuration={2} 
        hideDefaultCursor={true}
        isActive={isHomeSection}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900/30 to-black overflow-hidden px-8 md:px-16" id="home">
        <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
          <div className="container mx-auto min-h-screen">
            <div className="flex flex-col lg:flex-row items-center justify-center h-screen md:justify-between gap-12 lg:gap-20">
              
              {/* Left Column - Text Content */}
              <div className="w-full lg:w-1/2 space-y-8 text-left order-1 lg:order-1 pt-24"
                data-aos="fade-right"
                data-aos-delay="400">
                
                <StatusBadge />
                <MainTitle />

                {/* Subtitle with TextType */}
                <div className="text-2xl text-gray-300 font-medium" data-aos="fade-up" data-aos-delay="1600">
                  <TextType 
                    text={["Tech Enthusiast", "Mobile Visionary"]}
                    typingSpeed={75}
                    pauseDuration={2000}
                    deletingSpeed={50}
                    showCursor={true}
                    cursorCharacter="|"
                    cursorClassName="text-white animate-pulse"
                    className="text-2xl text-gray-300 font-medium"
                    loop={true}
                  />
                </div>

                {/* Description */}
                <p className="text-gray-300 text-lg leading-relaxed max-w-lg"
                  data-aos="fade-up"
                  data-aos-delay="2000">
                  Blending creativity, technology, and precision to build apps that inspire and perform.
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-3 justify-start" data-aos="fade-up" data-aos-delay="2400">
                  {TECH_STACK.map((tech, index) => (
                    <TechStack key={index} tech={tech.name} link={tech.link} />
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-row gap-4 w-full justify-start" data-aos="fade-up" data-aos-delay="2800">
                  <CTAButton href="#portfolio" text="Projects" icon={ExternalLink} />
                  <CTAButton href="#contact" text="Contact" icon={Mail} />
                </div>

                {/* Social Links */}
                <div className="flex gap-4 justify-start" data-aos="fade-up" data-aos-delay="3200">
                  {SOCIAL_LINKS.map((social, index) => (
                    <SocialLink key={index} {...social} />
                  ))}
                </div>
              </div>

              {/* Right Column - Complex Illustration */}
              <div className="w-full lg:w-1/2 h-auto lg:h-[600px] xl:h-[750px] relative flex items-center justify-center order-2 lg:order-2"
                data-aos="fade-left"
                data-aos-delay="1000">
                
                <div className="relative w-96 h-96 lg:w-[500px] lg:h-[500px]">
                  
                  {/* Background glow effects - white/gray themed */}
                  <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-white/10 to-gray-200/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-gray-300/10 to-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

                  {/* Main Monitor/Screen with enhanced animations */}
                  <div className="absolute top-16 left-16 w-72 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-600/50 shadow-2xl transform rotate-6 hover:rotate-3 transition-all duration-500 hover:scale-105 animate-float">
                    {/* Monitor header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <div className="text-xs text-gray-400 animate-pulse">MainActivity.kt</div>
                    </div>
                    
                    {/* Kotlin Code content */}
                    <div className="p-4 space-y-2 font-mono text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-white">class</span>
                        <span className="text-gray-200">MainActivity</span>
                        <span className="text-gray-300">:</span>
                        <span className="text-gray-100">AppCompatActivity</span>
                        <span className="text-gray-300">()</span>
                        <span className="text-gray-300">&nbsp;{'{'}</span>
                      </div>
                      <div className="pl-2 space-y-1">
                        <div className="flex items-center space-x-1">
                          <span className="text-white">override</span>
                          <span className="text-white">fun</span>
                          <span className="text-gray-200">onCreate</span>
                          <span className="text-gray-300">()</span>
                          <span className="text-gray-300">&nbsp;{'{'}</span>
                        </div>
                        <div className="pl-4 space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-200">super</span>
                            <span className="text-gray-300">.</span>
                            <span className="text-gray-200">onCreate</span>
                            <span className="text-gray-300">(savedInstanceState)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-200">setContentView</span>
                            <span className="text-gray-300">(</span>
                            <span className="text-gray-100">R.layout.main</span>
                            <span className="text-gray-300">)</span>
                          </div>
                        </div>
                        <div className="text-gray-300 pl-2">{'}'}</div>
                      </div>
                      <div className="text-gray-300">{'}'}</div>
                    </div>
                  </div>

                  {/* Mobile Phone with enhanced animations */}
                  <div className="absolute bottom-12 right-12 w-24 h-44 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-gray-600/50 shadow-2xl transform -rotate-12 hover:-rotate-6 transition-all duration-500 hover:scale-105 animate-float-delayed">
                    {/* Phone notch */}
                    <div className="w-16 h-1 bg-gray-700 rounded-full mx-auto mt-2"></div>
                    
                    {/* Phone screen */}
                    <div className="w-20 h-36 bg-gradient-to-br from-white/10 to-gray-200/10 rounded-xl mx-auto mt-2 p-2">
                      <div className="w-full h-6 bg-gradient-to-r from-white to-gray-200 rounded-lg mb-2 animate-pulse"></div>
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-600/50 rounded w-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="h-2 bg-gray-600/50 rounded w-3/4 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="h-2 bg-gray-600/50 rounded w-1/2 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                        <div className="h-2 bg-gray-600/50 rounded w-2/3 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      
                      {/* App icons with staggered animations */}
                      <div className="grid grid-cols-3 gap-1 mt-4">
                        <div className="w-3 h-3 bg-gray-300 rounded animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-white rounded animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-3 h-3 bg-gray-400 rounded animate-bounce" style={{animationDelay: '0.3s'}}></div>
                        <div className="w-3 h-3 bg-gray-200 rounded animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        <div className="w-3 h-3 bg-white rounded animate-bounce" style={{animationDelay: '0.5s'}}></div>
                        <div className="w-3 h-3 bg-gray-300 rounded animate-bounce" style={{animationDelay: '0.6s'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Code Brackets with enhanced animation */}
                  <div className="absolute top-8 right-8 text-4xl font-bold text-white/60 animate-bounce hover:text-white transition-colors duration-300">
                    &lt;/&gt;
                  </div>

                  {/* Gear Icons with different spin speeds */}
                  <div className="absolute top-12 left-8 text-gray-400/60 animate-spin hover:text-gray-300 transition-colors duration-300" style={{animationDuration: '8s'}}>
                    <Settings className="w-12 h-12" />
                  </div>
                  
                  <div className="absolute bottom-8 left-8 text-gray-500/40 animate-spin hover:text-gray-400 transition-colors duration-300" style={{animationDuration: '12s', animationDirection: 'reverse'}}>
                    <Settings className="w-8 h-8" />
                  </div>

                  {/* Download/Upload Icons with enhanced bounce */}
                  <div className="absolute top-32 right-4 text-gray-300/60 animate-bounce hover:text-white transition-colors duration-300" style={{animationDelay: '1s'}}>
                    <Download className="w-6 h-6" />
                  </div>
                  
                  <div className="absolute bottom-32 left-4 text-gray-200/60 animate-bounce hover:text-white transition-colors duration-300" style={{animationDelay: '2s'}}>
                    <Cloud className="w-6 h-6" />
                  </div>

                  {/* Floating geometric shapes with enhanced animations */}
                  <div className="absolute top-20 left-32 w-6 h-6 bg-gradient-to-br from-white to-gray-300 rounded-lg animate-bounce transform rotate-45 hover:scale-110 transition-transform duration-300" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-20 right-32 w-4 h-4 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full animate-bounce hover:scale-110 transition-transform duration-300" style={{animationDelay: '1.5s'}}></div>
                  <div className="absolute top-40 right-20 w-3 h-3 bg-gradient-to-br from-white to-gray-200 rotate-45 animate-bounce hover:scale-110 transition-transform duration-300" style={{animationDelay: '2.5s'}}></div>

                  {/* Additional small elements with glow effects */}
                  <div className="absolute top-1/2 left-0 w-2 h-8 bg-gradient-to-b from-white/60 to-transparent rounded-full animate-pulse hover:from-white/80 transition-colors duration-300"></div>
                  <div className="absolute top-1/3 right-0 w-2 h-6 bg-gradient-to-b from-gray-300/60 to-transparent rounded-full animate-pulse hover:from-gray-200/80 transition-colors duration-300" style={{animationDelay: '1s'}}></div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Home);

/* Custom CSS Animations */
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(6deg); }
    50% { transform: translateY(-10px) rotate(6deg); }
  }
  
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(-12deg); }
    50% { transform: translateY(-8px) rotate(-12deg); }
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-float-delayed {
    animation: float-delayed 8s ease-in-out infinite;
    animation-delay: 2s;
  }
  
  .animate-blink {
    animation: blink 1s infinite;
  }
  
  /* AOS-like animations */
  [data-aos] {
    opacity: 0;
    transition-property: opacity, transform;
    transition-duration: 1.2s;
    transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  [data-aos="fade-up"] {
    transform: translateY(30px);
  }
  
  [data-aos="fade-right"] {
    transform: translateX(-30px);
  }
  
  [data-aos="fade-left"] {
    transform: translateX(30px);
  }
  
  [data-aos="zoom-in"] {
    transform: scale(0.8);
  }
  
  [data-aos].aos-animate {
    opacity: 1;
    transform: translateX(0) translateY(0) scale(1);
  }
  
  /* Smooth page load animation */
  .animate-page-load {
    animation: pageLoad 1s ease-out forwards;
  }
  
  @keyframes pageLoad {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);