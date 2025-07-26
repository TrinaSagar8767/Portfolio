import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  meta,
  starbucks,
  tesla,
  shopify,
  carrent,
  jobit,
  tripguide,
  threejs,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "AI and Machine Learning",
    icon: web,
  },
  {
    title: "Cybersecurity",
    icon: mobile,
  },
  {
    title: "Human-Computer Interaction",
    icon: backend,
  },
  {
    title: "Game Development and Artistic Applications",
    icon: creator,
  },
];

{/* frameworks and tools */}
const technologies = [
  {
    name: "React",
    icon: html,
  },
  {
    name: "Node.js",
    icon: css,
  },
  {
    name: "Three.js",
    icon: javascript,
  },
  {
    name: "AWS",
    icon: typescript,
  },
  {
    name: "Docker",
    icon: reactjs,
  },
  {
    name: "Git",
    icon: redux,
  },
  {
    name: "Unity",
    icon: tailwind,
  },
  {
    name: "Godot",
    icon: nodejs,
  },
  {
    name: "OpenGL",
    icon: mongodb,
  },
  {
    name: "PyTorch",
    icon: threejs,
  },
  {
    name: "MySQL",
    icon: git,
  },
  {
    name: "Bash",
    icon: figma,
  },
  {
    name: "Eclipse",
    icon: docker,
  },
  {
    name: "VS Code",
    icon: docker,
  },
];

{/* frameworks and tools */}
const languages = [
  {
    name: "Python",
    icon: html,
  },
  {
    name: "C++",
    icon: css,
  },
  {
    name: "C",
    icon: javascript,
  },
  {
    name: "C#",
    icon: typescript,
  },
  {
    name: "Java",
    icon: reactjs,
  },
  {
    name: "Javascript",
    icon: redux,
  },
  {
    name: "Rust",
    icon: tailwind,
  },
  {
    name: "Go",
    icon: nodejs,
  },
  {
    name: "Haskell",
    icon: mongodb,
  },
  {
    name: "Prolog",
    icon: threejs,
  },
  {
    name: "Erlang",
    icon: git,
  },
  {
    name: "HTML",
    icon: figma,
  },
  {
    name: "CSS",
    icon: docker,
  },
  {
    name: "MySQL",
    icon: docker,
  },
  {
    name: "MATLAB",
    icon: docker,
  },
  {
    name: "PHP",
    icon: docker,
  },
  {
    name: "x86",
    icon: docker,
  },
  {
    name: "RISC-V",
    icon: docker,
  },
  {
    name: "R",
    icon: docker,
  },
];

const experiences = [
  {
    title: "Senior year of high school",
    company_name: "Starbucks",
    icon: starbucks,
    iconBg: "#383E56",
    date: "March 2020 - April 2021",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
  {
    title: "React Native Developer",
    company_name: "Tesla",
    icon: tesla,
    iconBg: "#E6DEDD",
    date: "Jan 2021 - Feb 2022",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
  {
    title: "Web Developer",
    company_name: "Shopify",
    icon: shopify,
    iconBg: "#383E56",
    date: "Jan 2022 - Jan 2023",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
  {
    title: "Full stack Developer",
    company_name: "Meta",
    icon: meta,
    iconBg: "#E6DEDD",
    date: "Jan 2023 - Present",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
];

{/*
const testimonials = [
  {
    testimonial:
      "I thought it was impossible to make a website as beautiful as our product, but Rick proved me wrong.",
    name: "Sara Lee",
    designation: "CFO",
    company: "Acme Co",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    testimonial:
      "I've never met a web developer who truly cares about their clients' success like Rick does.",
    name: "Chris Brown",
    designation: "COO",
    company: "DEF Corp",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    testimonial:
      "After Rick optimized our website, our traffic increased by 50%. We can't thank them enough!",
    name: "Lisa Wang",
    designation: "CTO",
    company: "456 Enterprises",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];
*/}

const projects = [
  {
    name: "Car Rent",
    description:
      "Web-based platform that allows users to search, book, and manage car rentals from various providers, providing a convenient and efficient solution for transportation needs.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "mongodb",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: carrent,
    source_code_link: "https://github.com/",
  },
  {
    name: "Job IT",
    description:
      "Web application that enables users to search for job openings, view estimated salary ranges for positions, and locate available jobs based on their current location.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "restapi",
        color: "green-text-gradient",
      },
      {
        name: "scss",
        color: "pink-text-gradient",
      },
    ],
    image: jobit,
    source_code_link: "https://github.com/",
  },
  {
    name: "Trip Guide",
    description:
      "A comprehensive travel booking platform that allows users to book flights, hotels, and rental cars, and offers curated recommendations for popular destinations.",
    tags: [
      {
        name: "nextjs",
        color: "blue-text-gradient",
      },
      {
        name: "supabase",
        color: "green-text-gradient",
      },
      {
        name: "css",
        color: "pink-text-gradient",
      },
    ],
    image: tripguide,
    source_code_link: "https://github.com/",
  },
];

export { services, technologies, experiences, testimonials, projects };