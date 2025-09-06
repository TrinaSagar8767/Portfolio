import { motion } from "framer-motion";

import { styles } from "../styles";
import { FluidObjectCanvas } from "./canvas";

const Hero = () => {
  return (
    <section className={`relative w-full h-screen mx-auto`}>
      <div
        className={`absolute inset-0 top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
      >
        {/* Pulsing Star Line */}
<div className="flex flex-col items-center mt-5 space-y-2">
  {/* Top Glowing Star */}
  {/*
  <motion.div
    animate={{ scale: [1, 2.0, 1], opacity: [1, 0.6, 1] }}
    transition={{ duration: 3.5, repeat: Infinity }}
    className="text-[20px]"
    style={{ color: "#a0dcd9", textShadow: "0 0 8px #a0dcd9" }}
  >
    ★
  </motion.div>
    */}
  {/* Vertical Line of Stars */}
  {Array.from({ length: 22 }).map((_, i) => (
    <motion.div
      key={i}
      animate={{ scale: [1, 3.4, 1], opacity: [1, 0.6, 1] }}
      transition={{
        duration: 5.5,
        repeat: Infinity,
        delay: i * 0.2,
      }}
      className="text-[14px]"
      style={{ color: "#a0dcd9", textShadow: "0 0 6px #a0dcd9" }}
    >
      ★
    </motion.div>
  ))}
</div>


        {/* Text */}
        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            Welcome to{" "}
            <span
              style={{
                color: "#dff6fcff",
                textShadow:
                  "0 0 8px #4683fcff, 0 0 20px #4686fcff, 0 0 30px #6ba1e9ff",
              }}
            >
              my portfolio
            </span>
          </h1>
          <p className={`${styles.heroSubText} mt-2 text-white-100`}>
            I'm passionate about AI, cybersecurity, <br className="sm:block hidden" />
            HCI and creative applications
          </p>
        </div>
      </div>

      <FluidObjectCanvas />

      <div className="absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center">
        <a href="#about">
          <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="w-3 h-3 rounded-full bg-secondary mb-1"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
