import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ImageSlider = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const slides = [
    {
      image: "/bg1.png",
      title: "Let’s get started",
      description:
        "Revolutionizing item recovery with blockchain - secure,transparent and rewarding.",
    },
    {
      image: "/bg2.png",
      title: "Seamless Recovery, Instant Rewards",
      description: "Lost it? Found it? Get Connected, Verified and Rewarded.",
    },
  ];

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const textVariants = {
    enter: (direction) => ({
      y: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      y: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setCurrentImage(currentImage + newDirection);
  };

  return (
    <div className="text-center">
      {/* Animated Text - Now above the image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial="enter"
          animate="center"
          exit="exit"
          variants={textVariants}
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="text-white px-4 mb-6"
        >
          <h2 className="text-5xl font-bold mb-2 font-iceberg">
            {slides[Math.abs(currentImage) % slides.length].title}
          </h2>
          <p className="text-gray-200">
            {slides[Math.abs(currentImage) % slides.length].description}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="relative w-[350px] h-[250px] mx-auto">
        <AnimatePresence initial={false} custom={currentImage}>
          <motion.img
            key={currentImage}
            src={slides[Math.abs(currentImage) % slides.length].image}
            custom={currentImage}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full h-full object-cover rounded-lg"
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {currentImage % slides.length === 0 && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors duration-200"
            onClick={() => paginate(1)}
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>
        )}
        {currentImage % slides.length === 1 && (
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors duration-200"
            onClick={() => paginate(-1)}
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
        )}

        {/* Dots Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === Math.abs(currentImage) % slides.length
                  ? "bg-white"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
