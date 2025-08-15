/* eslint-disable no-unused-vars */
import React, { useEffect, useRef } from 'react';
import { ExternalLink, Github, Eye, Star, GitFork, Award, Code, Monitor, Database, Smartphone, Globe, Palette, Settings } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useInView,
  useAnimation,
} from "framer-motion";
import {
  Children,
  cloneElement,
  useMemo,
  useState,
} from "react";

// Animation variants for scroll effects
const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 80,
    scale: 0.9,
    filter: "blur(6px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInScale = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotateY: 15,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.9, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const dockVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.3
    }
  }
};

// Custom hook for reliable scroll detection - ALWAYS triggers
const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, { 
    threshold: threshold,
    once: false, // Allow re-triggering
    margin: "-100px 0px" // Trigger earlier
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden"); // Reset when out of view
    }
  }, [controls, inView]);

  return { ref, controls, inView };
};

// Tech Logo Component
const TechLogo = ({ src, alt, fallback }) => {
  const [imageError, setImageError] = useState(false);
  
  if (imageError || !src) {
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white text-lg font-bold">
        {fallback}
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt}
      className="w-12 h-12 object-contain"
      onError={() => setImageError(true)}
    />
  );
};

// Dock Components with enhanced animations
function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-600/50 backdrop-blur-md shadow-lg hover:border-white/50 transition-all duration-300 cursor-pointer ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
      }}
      whileTap={{ scale: 0.95 }}
    >
      {Children.map(children, (child) =>
        cloneElement(child, { isHovered })
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = "", ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -15, scale: 1 }}
          exit={{ opacity: 0, y: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`${className} absolute -top-12 left-1/2 w-fit whitespace-pre rounded-lg border border-white/50 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 text-sm text-white shadow-xl shadow-white/10`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "", isActive = false }) {
  return (
    <motion.div 
      className={`flex items-center justify-center transition-all duration-300 ${
        isActive ? 'text-white' : 'text-gray-300'
      } ${className}`}
      animate={{
        color: isActive ? "rgb(255 255 255)" : "rgb(209 213 219)",
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 80,
  distance = 200,
  panelHeight = 70,
  dockHeight = 256,
  baseItemSize = 60,
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(panelHeight, magnification + 20),
    [magnification, panelHeight]
  );

  const height = maxHeight;

  return (
    <div className="flex justify-center items-center w-full mb-16">
      <div
        style={{ height: height, scrollbarWidth: "none" }}
        className="flex items-center justify-center"
      >
        <motion.div
          onMouseMove={({ pageX }) => {
            isHovered.set(1);
            mouseX.set(pageX);
          }}
          onMouseLeave={() => {
            isHovered.set(0);
            mouseX.set(Infinity);
          }}
          className={`${className} flex items-center justify-center w-fit gap-4 rounded-3xl border-2 border-slate-600/50 bg-slate-800/40 backdrop-blur-md py-3 px-6 shadow-2xl shadow-white/5`}
          style={{ height: panelHeight }}
          role="toolbar"
          aria-label="Portfolio navigation dock"
          whileHover={{ 
            borderColor: "rgba(255, 255, 255, 0.3)",
            boxShadow: "0 25px 50px rgba(255, 255, 255, 0.1)"
          }}
          transition={{ duration: 0.3 }}
        >
          {items.map((item, index) => (
            <DockItem
              key={index}
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
            >
              <DockIcon isActive={item.isActive}>{item.icon}</DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

const PortfolioSection = () => {
  const [activeTab, setActiveTab] = React.useState('Projects');

  // Scroll animation hooks - more sensitive triggers
  const headerAnimation = useScrollAnimation(0.05);
  const dockAnimation = useScrollAnimation(0.1);
  const contentAnimation = useScrollAnimation(0.05);
  const githubAnimation = useScrollAnimation(0.2);

  const projects = [
    {
      id: 1,
      title: "Aritmatika Solver",
      description: "Program ini dirancang untuk mempermudah pengguna dalam menyelesaikan soal aritmatika secara otomatis.",
      tags: ["Python", "Tkinter", "Math"],
      category: "Desktop",
      githubUrl: "https://github.com/IbrahimAliAbel",
      featured: false,
      stats: { stars: 24, forks: 8 },
      image: "./src/assets/images/projects/aritmatika-solver.png"
    },
    {
      id: 2,
      title: "AutoChat-Discord",
      description: "AutoChat adalah solusi otomatisasi untuk mengirim pesan ke saluran Discord secara terjadwal. Pengguna dapat...",
      tags: ["Python", "Discord.py", "Automation"],
      category: "Bot",
      githubUrl: "https://github.com/IbrahimAliAbel",
      featured: false,
      stats: { stars: 32, forks: 12 },
      image: "./src/assets/images/projects/autochat-discord.png"
    },
    {
      id: 3,
      title: "Buku Catatan",
      description: "Buku Catatan adalah website yang memungkinkan pengguna untuk membuat, menyimpan, dan mengelola...",
      tags: ["HTML", "CSS", "JavaScript"],
      category: "Web",
      githubUrl: "https://github.com/IbrahimAliAbel",
      featured: false,
      stats: { stars: 18, forks: 5 },
      image: "./src/assets/images/projects/buku-catatan.png"
    }
  ];

  // Updated certificates dengan link external
  const certificates = [
    {
      id: 1,
      title: "Memulai Pemrograman dengan Kotlin",
      issuer: "Dicoding",
      date: "19 September 2024",
      credentialId: "NVP7QM4VGZR0",
      image: "./src/assets/images/certificates/belajarkotlin.jpg",
      certificateUrl: "https://www.dicoding.com/certificates/NVP7QM4VGZR0"
    },
    {
      id: 2,
      title: "Belajar Membuat Aplikasi Android untuk Pemula",
      issuer: "Dicoding", 
      date: "30 September 2024",
      credentialId: "QLZ9VK2YEX5D",
      image: "./src/assets/images/certificates/pemula.jpg",
      certificateUrl: "https://www.dicoding.com/certificates/QLZ9VK2YEX5D"
    },
    {
      id: 3,
      title: "Belajar Fundamental Aplikasi Android",
      issuer: "Dicoding",
      date: "21 Oktober 2024", 
      credentialId: "N9ZOYM4N6PG5",
      image: "./src/assets/images/certificates/fundamental.jpg",
      certificateUrl: "https://www.dicoding.com/certificates/N9ZOYM4N6PG5"
    },
     {
      id: 4,
      title: "Belajar Pengembangan Aplikasi Android Intermediate",
      issuer: "Dicoding",
      date: "17 Desember 2024", 
      credentialId: "NVP742RKRPR0",
      image: "./src/assets/images/certificates/intermediete.jpg",
      certificateUrl: "https://www.dicoding.com/certificates/NVP742RKRPR0"
    },
     {
      id: 5,
      title: "Belajar Penerapan Machine Learning untuk Android",
      issuer: "Dicoding",
      date: "04 November 2024", 
      credentialId: "KEXLY22L0ZG2",
      image: "./src/assets/images/certificates/machinelearning.jpg",
      certificateUrl: "https://www.dicoding.com/certificates/KEXLY22L0ZG2"
    }
  ];

  const techStack = [
    {
      name: "JavaScript",
      logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/javascript/javascript-original.svg",
      color: "from-gray-400 to-white",
      category: "Language",
      fallback: "JS"
    },
    {
      name: "Tailwind CSS",
      logoUrl: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg",
      color: "from-gray-500 to-gray-300", 
      category: "Framework",
      fallback: "TW"
    },
    {
      name: "React",
      logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/react/react-original.svg",
      color: "from-white to-gray-200",
      category: "Library",
      fallback: "⚛️"
    },
    {
      name: "Vite",
      logoUrl: "https://raw.githubusercontent.com/vitejs/vite/main/docs/public/logo.svg",
      color: "from-gray-300 to-gray-100",
      category: "Build Tool",
      fallback: "⚡"
    },
    {
      name: "Node.js",
      logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/nodejs/nodejs-original.svg",
      color: "from-gray-400 to-gray-200",
      category: "Runtime",
      fallback: "🟢"
    },
    {
      name: "Hapi.js",
      logoUrl: "https://avatars.githubusercontent.com/u/3774533?s=200&v=4",
      color: "from-white to-gray-300",
      category: "Framework",
      fallback: "H"
    },
    {
      name: "Firebase",
      logoUrl: "https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg",
      color: "from-gray-200 to-white",
      category: "Backend",
      fallback: "🔥"
    },
    {
      name: "SQLite",
      logoUrl: "https://www.vectorlogo.zone/logos/sqlite/sqlite-icon.svg",
      color: "from-gray-600 to-gray-400",
      category: "Database",
      fallback: "🗃️"
    },
    {
      name: "Python",
      logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/python/python-original.svg",
      color: "from-gray-300 to-gray-100",
      category: "Language",
      fallback: "🐍"
    },
    {
      name: "Streamlit",
      logoUrl: "https://docs.streamlit.io/logo.svg",
      color: "from-white to-gray-200",
      category: "Framework",
      fallback: "📊"
    },
    {
      name: "Kotlin",
      logoUrl: "https://www.vectorlogo.zone/logos/kotlinlang/kotlinlang-icon.svg",
      color: "from-gray-400 to-gray-200",
      category: "Language",
      fallback: "K"
    },
    {
      name: "Jetpack Compose",
      logoUrl: "https://developer.android.com/images/brand/Android_Robot.png",
      color: "from-gray-300 to-white",
      category: "UI Framework",
      fallback: "🎨"
    }
  ];

  const dockItems = [
    { 
      icon: <Code className="w-6 h-6" />, 
      label: 'Projects', 
      onClick: () => setActiveTab('Projects'),
      isActive: activeTab === 'Projects'
    },
    { 
      icon: <Award className="w-6 h-6" />, 
      label: 'Certificates', 
      onClick: () => setActiveTab('Certificates'),
      isActive: activeTab === 'Certificates'
    },
    { 
      icon: <Settings className="w-6 h-6" />, 
      label: 'Tech Stack', 
      onClick: () => setActiveTab('Tech Stack'),
      isActive: activeTab === 'Tech Stack'
    }
  ];

  const renderProjects = () => (
    <motion.div 
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={staggerContainer}
      initial="hidden"
      animate={contentAnimation.inView ? "visible" : "hidden"}
    >
      {projects.map((project, index) => (
        <motion.div 
          key={project.id} 
          variants={cardVariants}
          className="group bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-600/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/50 transition-all duration-300"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.5)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Project Image */}
          <div className="relative overflow-hidden h-48 bg-gradient-to-br from-gray-600/20 via-gray-500/20 to-gray-400/20">
            <motion.div 
              className="w-full h-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-6xl opacity-70">{project.image}</span>
            </motion.div>
            {project.featured && (
              <motion.div 
                className="absolute top-4 right-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
              >
                <span className="px-3 py-1 bg-white/90 text-black text-xs rounded-full backdrop-blur-sm border border-white/50">
                  Featured
                </span>
              </motion.div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <motion.h3 
                className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-1"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {project.title}
              </motion.h3>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <motion.div 
                  className="flex items-center space-x-1"
                  whileHover={{ scale: 1.1, color: "#d1d5db" }}
                >
                  <Star className="w-3 h-3" />
                  <span>{project.stats.stars}</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-1"
                  whileHover={{ scale: 1.1, color: "#d1d5db" }}
                >
                  <GitFork className="w-3 h-3" />
                  <span>{project.stats.forks}</span>
                </motion.div>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag, tagIndex) => (
                <motion.span
                  key={tagIndex}
                  className="px-3 py-1 bg-slate-700/60 border border-slate-600/50 rounded-full text-xs text-gray-200 backdrop-blur-sm"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + tagIndex * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.3)"
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Action Button - Only GitHub Details */}
            <div className="flex justify-center">
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-white/10 to-gray-200/10 hover:from-white/20 hover:to-gray-200/20 border border-white/30 text-white rounded-full text-sm font-medium transition-all"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 20px rgba(255, 255, 255, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Github className="w-3 h-3 mr-2" />
                View on GitHub
              </motion.a>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderCertificates = () => (
    <motion.div 
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={staggerContainer}
      initial="hidden"
      animate={contentAnimation.inView ? "visible" : "hidden"}
    >
      {certificates.map((cert, index) => (
        <motion.div 
          key={cert.id} 
          variants={cardVariants}
          className="group bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-600/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/50 transition-all duration-300"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Certificate Image */}
          <div className="relative overflow-hidden h-64 bg-gradient-to-br from-slate-700/30 to-slate-800/50">
            <motion.img
              src={cert.image}
              alt={cert.title}
              className="w-full h-full object-contain object-center p-4"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                // Fallback jika gambar tidak ditemukan
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback content jika gambar gagal load */}
            <motion.div 
              className="w-full h-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 items-center justify-center hidden"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="w-48 h-32 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center text-slate-800 text-xs relative"
                initial={{ rotateY: -10 }}
                whileHover={{ rotateY: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-2 left-2 w-16 h-4 bg-gray-400 rounded opacity-80"></div>
                <div className="text-center px-4">
                  <div className="w-20 h-3 bg-slate-300 rounded mb-2 mx-auto"></div>
                  <div className="w-16 h-2 bg-slate-200 rounded mb-1 mx-auto"></div>
                  <div className="w-24 h-2 bg-slate-200 rounded mb-2 mx-auto"></div>
                  <div className="w-12 h-1 bg-slate-300 rounded mx-auto"></div>
                </div>
                <motion.div 
                  className="absolute bottom-2 right-2 w-8 h-8 border-2 border-slate-700 rounded-full flex items-center justify-center text-xs font-bold"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ✓
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Certificate badge */}
            <motion.div 
              className="absolute top-4 right-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
            >
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/50">
                <Award className="w-6 h-6 text-black" />
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.h3 
              className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors mb-2 line-clamp-2"
              whileHover={{ x: 5 }}
            >
              {cert.title}
            </motion.h3>
            <p className="text-gray-300 text-sm font-medium mb-2">{cert.issuer}</p>
            <p className="text-gray-400 text-sm mb-4">{cert.date}</p>
            
            {/* Credential ID */}
            <motion.div 
              className="bg-slate-700/40 rounded-lg p-3 mb-4"
              whileHover={{ backgroundColor: "rgba(71, 85, 105, 0.6)" }}
            >
              <p className="text-xs text-gray-400 mb-1">Credential ID</p>
              <p className="text-sm text-gray-200 font-mono">{cert.credentialId}</p>
            </motion.div>

            {/* View Certificate Button */}
            <motion.a
              href={cert.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-white/10 to-gray-200/10 hover:from-white/20 hover:to-gray-200/20 border border-white/30 text-white rounded-full text-sm font-medium transition-all"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 20px rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              View Certificate
            </motion.a>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderTechStack = () => (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate={contentAnimation.inView ? "visible" : "hidden"}
    >
      {techStack.map((tech, index) => (
        <motion.div key={index} className="group" variants={cardVariants}>
          <motion.div 
            className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-600/50 rounded-2xl p-6 text-center hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 15px 30px rgba(255, 255, 255, 0.1)",
              rotateY: 5
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            {/* Logo/Icon */}
            <div className="relative z-10 mb-4">
              <motion.div 
                className="w-16 h-16 mx-auto rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center p-3 shadow-lg border border-slate-600/30"
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <TechLogo 
                  src={tech.logoUrl}
                  alt={tech.name}
                  fallback={tech.fallback}
                />
              </motion.div>
            </div>
            
            {/* Name */}
            <motion.h3 
              className="relative z-10 text-white font-semibold text-sm mb-2"
              whileHover={{ scale: 1.05 }}
            >
              {tech.name}
            </motion.h3>
            
            {/* Category */}
            <p className="relative z-10 text-gray-400 text-xs">{tech.category}</p>

            {/* Shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Projects':
        return renderProjects();
      case 'Certificates':
        return renderCertificates();
      case 'Tech Stack':
        return renderTechStack();
      default:
        return renderProjects();
    }
  };

  return (
    <div id="portfolio" className="min-h-screen bg-gradient-to-br from-black via-gray-900/30 to-black px-8 md:px-16 py-16 lg:py-24 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Scroll Animation */}
        <motion.div 
          ref={headerAnimation.ref}
          className="text-center mb-16"
          initial="hidden"
          animate={headerAnimation.controls}
          variants={fadeInUp}
        >
          <motion.h1 
            className="text-6xl lg:text-7xl font-bold mb-6"
            variants={fadeInUp}
          >
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
              Portfolio Showcase
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            A showcase of my dedication, creativity, and continuous pursuit of excellence in technology.
          </motion.p>
        </motion.div>

        {/* Dock Navigation with Scroll Animation */}
        <motion.div 
          ref={dockAnimation.ref}
          className="flex justify-center mb-16"
          initial="hidden"
          animate={dockAnimation.controls}
          variants={dockVariants}
        >
          <Dock
            items={dockItems}
            panelHeight={80}
            baseItemSize={65}
            magnification={85}
            distance={150}
          />
        </motion.div>

        {/* Content with Scroll Animation */}
        <motion.div 
          ref={contentAnimation.ref}
          className="relative"
          initial="hidden"
          animate={contentAnimation.controls}
          variants={fadeInScale}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-40 h-40 bg-gray-300/5 rounded-full blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.05, 0.1, 0.05]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-3xl"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Content Container */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* GitHub Link with Scroll Animation */}
        {activeTab === 'Projects' && (
          <motion.div 
            ref={githubAnimation.ref}
            className="text-center mt-16"
            initial="hidden"
            animate={githubAnimation.controls}
            variants={fadeInUp}
          >
            <motion.a
              href="https://github.com/IbrahimAliAbel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-white to-gray-200 text-black rounded-full font-medium transition-all shadow-lg shadow-white/10"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Github className="w-5 h-5 mr-3" />
              </motion.div>
              View All Projects on GitHub
            </motion.a>
          </motion.div>
        )}

        {/* Enhanced floating elements for visual enhancement */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating particles with scroll-triggered animations */}
          <motion.div
            className="absolute top-20 left-10 w-3 h-3 bg-white/20 rounded-full blur-sm"
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/3 right-20 w-2 h-2 bg-gray-300/30 rounded-full blur-sm"
            animate={{
              y: [0, 25, 0],
              x: [0, -15, 0],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute bottom-32 left-1/4 w-4 h-4 bg-white/15 rounded-full blur-sm"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
          
          {/* Additional dynamic particles */}
          <motion.div
            className="absolute top-2/3 right-1/4 w-1 h-1 bg-gray-200/40 rounded-full blur-sm"
            animate={{
              y: [0, -30, 0],
              x: [0, 25, 0],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 360, 720],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-1/5 right-10 w-2 h-2 bg-white/20 rounded-full blur-sm"
            animate={{
              y: [0, 18, 0],
              x: [0, -20, 0],
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </div>

        {/* Debug indicator for scroll animations */}
        {/* Debug panel removed for production */}
      </div>
    </div>
  );
};

export default PortfolioSection;