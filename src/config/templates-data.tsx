import { Code, Database, BrainCircuit, LayoutTemplate, Shield, Smartphone, Globe, Cpu, GitBranch, Cloud, Terminal, Network, Gamepad2, Blocks } from "lucide-react";

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tags: string[];
}

export const templates: TemplateItem[] = [
  {
    id: "t1",
    title: "Web Dev Mastery",
    description: "Roadmap belajar Full-stack Web Dev dari HTML/CSS hingga React & Next.js.",
    icon: <LayoutTemplate className="w-6 h-6 text-emerald-400" />,
    color: "emerald",
    tags: ["Web Dev", "Full-stack"],
  },
  {
    id: "t2",
    title: "Data Structures & Algorithms",
    description: "Fundamental struktur data dan algoritma untuk persiapan interview.",
    icon: <Code className="w-6 h-6 text-amber-400" />,
    color: "amber",
    tags: ["DSA", "Interview"],
  },
  {
    id: "t3",
    title: "Machine Learning Basics",
    description: "Menguasai Python, Pandas, Scikit-learn, hingga Neural Networks.",
    icon: <BrainCircuit className="w-6 h-6 text-blue-400" />,
    color: "blue",
    tags: ["AI", "Data Science"],
  },
  {
    id: "t4",
    title: "Database Administration",
    description: "Belajar SQL, Normalisasi, Indexing, dan pengenalan NoSQL.",
    icon: <Database className="w-6 h-6 text-purple-400" />,
    color: "purple",
    tags: ["Database", "Backend"],
  },
  {
    id: "t5",
    title: "Cybersecurity Fundamentals",
    description: "Dasar keamanan jaringan, kriptografi, ethical hacking, dan OWASP Top 10.",
    icon: <Shield className="w-6 h-6 text-red-400" />,
    color: "red",
    tags: ["Security", "Networking"],
  },
  {
    id: "t6",
    title: "Mobile App Development",
    description: "Belajar React Native dari nol hingga publish ke Play Store.",
    icon: <Smartphone className="w-6 h-6 text-cyan-400" />,
    color: "cyan",
    tags: ["Mobile", "React Native"],
  },
  {
    id: "t7",
    title: "Cloud Computing & DevOps",
    description: "Docker, CI/CD, Kubernetes, dan pengenalan AWS/GCP untuk deploy.",
    icon: <Cloud className="w-6 h-6 text-sky-400" />,
    color: "sky",
    tags: ["Cloud", "DevOps"],
  },
  {
    id: "t8",
    title: "Operating Systems",
    description: "Konsep OS: proses, thread, memory management, dan file system.",
    icon: <Terminal className="w-6 h-6 text-orange-400" />,
    color: "orange",
    tags: ["OS", "Sistem"],
  },
  {
    id: "t9",
    title: "Computer Networking",
    description: "Model OSI/TCP-IP, protokol HTTP, DNS, subnetting, dan socket programming.",
    icon: <Network className="w-6 h-6 text-teal-400" />,
    color: "teal",
    tags: ["Jaringan", "Protokol"],
  },
  {
    id: "t10",
    title: "Git & Version Control",
    description: "Menguasai Git workflow, branching, merge conflict, dan kolaborasi GitHub.",
    icon: <GitBranch className="w-6 h-6 text-pink-400" />,
    color: "pink",
    tags: ["Git", "Kolaborasi"],
  },
  {
    id: "t11",
    title: "UI/UX Design for Developers",
    description: "Prinsip desain, Figma workflow, design system, dan user testing.",
    icon: <Globe className="w-6 h-6 text-violet-400" />,
    color: "violet",
    tags: ["UI/UX", "Desain"],
  },
  {
    id: "t12",
    title: "Object-Oriented Programming",
    description: "Konsep OOP dengan Java: Inheritance, Polymorphism, Abstraction, dan Design Patterns.",
    icon: <Blocks className="w-6 h-6 text-lime-400" />,
    color: "lime",
    tags: ["OOP", "Java"],
  },
  {
    id: "t13",
    title: "Game Development Basics",
    description: "Pengantar Unity, C# scripting, physics engine, dan 2D game design.",
    icon: <Gamepad2 className="w-6 h-6 text-rose-400" />,
    color: "rose",
    tags: ["Game Dev", "Unity"],
  },
  {
    id: "t14",
    title: "Embedded Systems & IoT",
    description: "Pemrograman Arduino, sensor, komunikasi serial, dan project IoT sederhana.",
    icon: <Cpu className="w-6 h-6 text-yellow-400" />,
    color: "yellow",
    tags: ["IoT", "Hardware"],
  },
];

// Helper to generate a unique ID
const genId = () => crypto.randomUUID();

// Shorthand builder for child items
function c(name: string, startOffset: number, duration: number) {
  return { id: genId(), name, progress: 0, type: "child" as const, startOffset, duration };
}

// Shorthand builder for parent items
function p(name: string, startOffset: number, duration: number, children: ReturnType<typeof c>[]) {
  return { id: genId(), name, progress: 0, type: "parent" as const, startOffset, duration, children };
}

export function generateRoadmapData(templateId: string) {
  switch (templateId) {
    case "t1": return [
      p("Week 1: HTML & CSS Fundamentals", 0, 7, [
        c("Day 1-2: HTML5 & Semantic Tags", 0, 2),
        c("Day 3-4: CSS3, Flexbox & Grid", 2, 2),
        c("Day 5-6: Responsive Design & Media Queries", 4, 2),
        c("Day 7: Mini Project - Landing Page", 6, 1),
      ]),
      p("Week 2: JavaScript Core", 7, 7, [
        c("Day 8-9: Variables, Functions & Loops", 7, 2),
        c("Day 10-11: DOM Manipulation & Events", 9, 2),
        c("Day 12-13: ES6+ (Arrow, Destructuring, Spread)", 11, 2),
        c("Day 14: Async/Await & Fetch API", 13, 1),
      ]),
      p("Week 3: React.js", 14, 7, [
        c("Day 15-16: JSX, Components & Props", 14, 2),
        c("Day 17-18: useState & useEffect Hooks", 16, 2),
        c("Day 19-20: React Router & API Integration", 18, 2),
        c("Day 21: Mini Project - Todo App", 20, 1),
      ]),
      p("Week 4: Next.js & Deployment", 21, 7, [
        c("Day 22-23: Next.js Pages & Routing", 21, 2),
        c("Day 24-25: Server Components & Data Fetching", 23, 2),
        c("Day 26-27: Authentication & Database (Supabase)", 25, 2),
        c("Day 28: Deploy ke Vercel", 27, 1),
      ]),
    ];

    case "t2": return [
      p("Week 1: Arrays & Strings", 0, 7, [
        c("Day 1-2: Array Operations & Two Pointers", 0, 2),
        c("Day 3-4: String Manipulation & Pattern Matching", 2, 2),
        c("Day 5-6: Sliding Window Technique", 4, 2),
        c("Day 7: Practice Problems (LeetCode Easy)", 6, 1),
      ]),
      p("Week 2: Linked Lists & Stacks", 7, 7, [
        c("Day 8-9: Singly & Doubly Linked Lists", 7, 2),
        c("Day 10-11: Stack & Queue Implementation", 9, 2),
        c("Day 12-13: Recursion & Backtracking", 11, 2),
        c("Day 14: Practice Problems (LeetCode Medium)", 13, 1),
      ]),
      p("Week 3: Trees & Graphs", 14, 7, [
        c("Day 15-16: Binary Trees & BST", 14, 2),
        c("Day 17-18: BFS & DFS Traversal", 16, 2),
        c("Day 19-20: Graph Representation & Dijkstra", 18, 2),
        c("Day 21: Practice Problems (LeetCode Medium)", 20, 1),
      ]),
      p("Week 4: Sorting & Dynamic Programming", 21, 7, [
        c("Day 22-23: Merge Sort & Quick Sort", 21, 2),
        c("Day 24-25: DP Basics (Fibonacci, Knapsack)", 23, 2),
        c("Day 26-27: DP Advanced (LCS, Coin Change)", 25, 2),
        c("Day 28: Mock Interview Session", 27, 1),
      ]),
    ];

    case "t3": return [
      p("Week 1: Python & Math Foundation", 0, 7, [
        c("Day 1-2: Python Basics & NumPy", 0, 2),
        c("Day 3-4: Pandas & Data Cleaning", 2, 2),
        c("Day 5-6: Linear Algebra & Statistics", 4, 2),
        c("Day 7: Data Visualization (Matplotlib)", 6, 1),
      ]),
      p("Week 2: Supervised Learning", 7, 7, [
        c("Day 8-9: Linear & Logistic Regression", 7, 2),
        c("Day 10-11: Decision Trees & Random Forest", 9, 2),
        c("Day 12-13: SVM & Model Evaluation", 11, 2),
        c("Day 14: Mini Project - Iris Classification", 13, 1),
      ]),
      p("Week 3: Unsupervised & Neural Networks", 14, 7, [
        c("Day 15-16: K-Means & PCA", 14, 2),
        c("Day 17-18: Intro to Neural Networks (Perceptron)", 16, 2),
        c("Day 19-20: TensorFlow/Keras Basics", 18, 2),
        c("Day 21: Mini Project - MNIST Digit Recognition", 20, 1),
      ]),
    ];

    case "t4": return [
      p("Week 1: SQL Fundamentals", 0, 7, [
        c("Day 1-2: SELECT, INSERT, UPDATE, DELETE", 0, 2),
        c("Day 3-4: JOINs & Subqueries", 2, 2),
        c("Day 5-6: Aggregate Functions & GROUP BY", 4, 2),
        c("Day 7: Practice SQL di HackerRank", 6, 1),
      ]),
      p("Week 2: Database Design", 7, 7, [
        c("Day 8-9: ERD & Relational Model", 7, 2),
        c("Day 10-11: Normalization (1NF - 3NF)", 9, 2),
        c("Day 12-13: Indexing & Query Optimization", 11, 2),
        c("Day 14: Mini Project - Design a School DB", 13, 1),
      ]),
      p("Week 3: Advanced & NoSQL", 14, 7, [
        c("Day 15-16: Transactions & ACID Properties", 14, 2),
        c("Day 17-18: Stored Procedures & Triggers", 16, 2),
        c("Day 19-20: Intro to MongoDB & NoSQL", 18, 2),
        c("Day 21: Final Project - Full CRUD App + DB", 20, 1),
      ]),
    ];

    case "t5": return [
      p("Week 1: Security Fundamentals", 0, 7, [
        c("Day 1-2: CIA Triad & Security Principles", 0, 2),
        c("Day 3-4: Kriptografi (Symmetric & Asymmetric)", 2, 2),
        c("Day 5-6: Hashing & Digital Signatures", 4, 2),
        c("Day 7: Lab - Encrypt/Decrypt with OpenSSL", 6, 1),
      ]),
      p("Week 2: Network Security", 7, 7, [
        c("Day 8-9: Firewall & IDS/IPS Concepts", 7, 2),
        c("Day 10-11: Wireshark & Packet Analysis", 9, 2),
        c("Day 12-13: VPN, SSL/TLS & HTTPS", 11, 2),
        c("Day 14: Lab - Network Traffic Analysis", 13, 1),
      ]),
      p("Week 3: Web Security & Ethical Hacking", 14, 7, [
        c("Day 15-16: OWASP Top 10 (XSS, SQLi, CSRF)", 14, 2),
        c("Day 17-18: Burp Suite & Vulnerability Scanning", 16, 2),
        c("Day 19-20: Authentication Attacks & Mitigation", 18, 2),
        c("Day 21: CTF Challenge Practice", 20, 1),
      ]),
    ];

    case "t6": return [
      p("Week 1: React Native Setup", 0, 7, [
        c("Day 1-2: Environment Setup & Expo", 0, 2),
        c("Day 3-4: Core Components (View, Text, Image)", 2, 2),
        c("Day 5-6: Styling & Flexbox di Mobile", 4, 2),
        c("Day 7: Mini App - Profile Card", 6, 1),
      ]),
      p("Week 2: Navigation & State", 7, 7, [
        c("Day 8-9: React Navigation (Stack & Tab)", 7, 2),
        c("Day 10-11: State Management & Context API", 9, 2),
        c("Day 12-13: Forms & User Input", 11, 2),
        c("Day 14: Mini App - Note Taking", 13, 1),
      ]),
      p("Week 3: API & Native Features", 14, 7, [
        c("Day 15-16: REST API & Axios Integration", 14, 2),
        c("Day 17-18: Camera, Location & Permissions", 16, 2),
        c("Day 19-20: Local Storage (AsyncStorage)", 18, 2),
        c("Day 21: Mini App - Weather App", 20, 1),
      ]),
      p("Week 4: Publishing", 21, 7, [
        c("Day 22-23: Firebase Auth & Firestore", 21, 2),
        c("Day 24-25: Push Notifications", 23, 2),
        c("Day 26-27: Build APK & Testing", 25, 2),
        c("Day 28: Publish ke Google Play Store", 27, 1),
      ]),
    ];

    case "t7": return [
      p("Week 1: Linux & Containers", 0, 7, [
        c("Day 1-2: Linux CLI & Shell Scripting", 0, 2),
        c("Day 3-4: Docker Basics & Dockerfile", 2, 2),
        c("Day 5-6: Docker Compose & Multi-container", 4, 2),
        c("Day 7: Lab - Dockerize a Node.js App", 6, 1),
      ]),
      p("Week 2: CI/CD Pipelines", 7, 7, [
        c("Day 8-9: GitHub Actions Fundamentals", 7, 2),
        c("Day 10-11: Automated Testing in Pipeline", 9, 2),
        c("Day 12-13: Build & Deploy Automation", 11, 2),
        c("Day 14: Lab - Full CI/CD Pipeline", 13, 1),
      ]),
      p("Week 3: Cloud & Orchestration", 14, 7, [
        c("Day 15-16: AWS/GCP Basics (EC2, Cloud Run)", 14, 2),
        c("Day 17-18: Kubernetes Concepts & Pods", 16, 2),
        c("Day 19-20: Services, Deployments & Scaling", 18, 2),
        c("Day 21: Final Project - Deploy App to Cloud", 20, 1),
      ]),
    ];

    case "t8": return [
      p("Week 1: Process & Thread", 0, 7, [
        c("Day 1-2: Process Lifecycle & PCB", 0, 2),
        c("Day 3-4: Thread & Multithreading", 2, 2),
        c("Day 5-6: CPU Scheduling (FCFS, SJF, RR)", 4, 2),
        c("Day 7: Lab - Simulate Scheduling in Python", 6, 1),
      ]),
      p("Week 2: Memory Management", 7, 7, [
        c("Day 8-9: Paging & Segmentation", 7, 2),
        c("Day 10-11: Virtual Memory & Page Replacement", 9, 2),
        c("Day 12-13: Deadlock Detection & Prevention", 11, 2),
        c("Day 14: Lab - Memory Allocation Simulator", 13, 1),
      ]),
      p("Week 3: File System & I/O", 14, 7, [
        c("Day 15-16: File System Structure & Allocation", 14, 2),
        c("Day 17-18: Disk Scheduling Algorithms", 16, 2),
        c("Day 19-20: I/O Management & Buffering", 18, 2),
        c("Day 21: Final Review & Practice Exam", 20, 1),
      ]),
    ];

    case "t9": return [
      p("Week 1: Network Fundamentals", 0, 7, [
        c("Day 1-2: OSI Model & TCP/IP Layers", 0, 2),
        c("Day 3-4: IP Addressing & Subnetting", 2, 2),
        c("Day 5-6: DNS, DHCP & ARP", 4, 2),
        c("Day 7: Lab - Subnetting Practice", 6, 1),
      ]),
      p("Week 2: Transport & Application Layer", 7, 7, [
        c("Day 8-9: TCP vs UDP & 3-Way Handshake", 7, 2),
        c("Day 10-11: HTTP/HTTPS & REST API", 9, 2),
        c("Day 12-13: FTP, SMTP & Email Protocols", 11, 2),
        c("Day 14: Lab - Wireshark Packet Capture", 13, 1),
      ]),
      p("Week 3: Advanced Networking", 14, 7, [
        c("Day 15-16: Routing Protocols (RIP, OSPF)", 14, 2),
        c("Day 17-18: VLAN & Network Segmentation", 16, 2),
        c("Day 19-20: Socket Programming (Python)", 18, 2),
        c("Day 21: Final Project - Chat App with Sockets", 20, 1),
      ]),
    ];

    case "t10": return [
      p("Week 1: Git Basics", 0, 7, [
        c("Day 1-2: Init, Add, Commit & Log", 0, 2),
        c("Day 3-4: Branching & Merging", 2, 2),
        c("Day 5-6: Remote Repos & Push/Pull", 4, 2),
        c("Day 7: Lab - Setup GitHub Repository", 6, 1),
      ]),
      p("Week 2: Advanced Git & Collaboration", 7, 7, [
        c("Day 8-9: Merge Conflicts & Rebase", 7, 2),
        c("Day 10-11: Pull Requests & Code Review", 9, 2),
        c("Day 12-13: Git Flow & Branch Strategy", 11, 2),
        c("Day 14: Lab - Team Collaboration Simulation", 13, 1),
      ]),
    ];

    case "t11": return [
      p("Week 1: Design Principles", 0, 7, [
        c("Day 1-2: Visual Hierarchy & Color Theory", 0, 2),
        c("Day 3-4: Typography & Spacing Systems", 2, 2),
        c("Day 5-6: Layout Patterns & Responsiveness", 4, 2),
        c("Day 7: Case Study - Redesign a Bad Website", 6, 1),
      ]),
      p("Week 2: Figma Mastery", 7, 7, [
        c("Day 8-9: Figma Interface & Auto Layout", 7, 2),
        c("Day 10-11: Components & Design Tokens", 9, 2),
        c("Day 12-13: Prototyping & Interactions", 11, 2),
        c("Day 14: Mini Project - Design a Mobile App", 13, 1),
      ]),
      p("Week 3: Design System & UX", 14, 7, [
        c("Day 15-16: Build a Design System from Scratch", 14, 2),
        c("Day 17-18: User Persona & User Journey Map", 16, 2),
        c("Day 19-20: Usability Testing & Feedback", 18, 2),
        c("Day 21: Final Project - Complete App Redesign", 20, 1),
      ]),
    ];

    case "t12": return [
      p("Week 1: OOP Fundamentals (Java)", 0, 7, [
        c("Day 1-2: Classes, Objects & Constructors", 0, 2),
        c("Day 3-4: Encapsulation & Access Modifiers", 2, 2),
        c("Day 5-6: Inheritance & Method Overriding", 4, 2),
        c("Day 7: Lab - Build a Student Management Class", 6, 1),
      ]),
      p("Week 2: Advanced OOP", 7, 7, [
        c("Day 8-9: Polymorphism & Interfaces", 7, 2),
        c("Day 10-11: Abstract Classes & Generics", 9, 2),
        c("Day 12-13: Exception Handling & Collections", 11, 2),
        c("Day 14: Lab - Build a Library System", 13, 1),
      ]),
      p("Week 3: Design Patterns", 14, 7, [
        c("Day 15-16: Singleton, Factory & Observer", 14, 2),
        c("Day 17-18: Strategy, Decorator & Adapter", 16, 2),
        c("Day 19-20: MVC Architecture Pattern", 18, 2),
        c("Day 21: Final Project - Apply Patterns to App", 20, 1),
      ]),
    ];

    case "t13": return [
      p("Week 1: Unity & C# Basics", 0, 7, [
        c("Day 1-2: Unity Interface & Scene Setup", 0, 2),
        c("Day 3-4: C# Scripting Basics (Variables, Functions)", 2, 2),
        c("Day 5-6: GameObjects, Components & Transform", 4, 2),
        c("Day 7: Lab - Moving a Character", 6, 1),
      ]),
      p("Week 2: 2D Game Mechanics", 7, 7, [
        c("Day 8-9: Sprites, Animation & Animator", 7, 2),
        c("Day 10-11: Physics 2D (Rigidbody, Collider)", 9, 2),
        c("Day 12-13: User Input & Player Controller", 11, 2),
        c("Day 14: Mini Game - Simple Platformer", 13, 1),
      ]),
      p("Week 3: Game Systems", 14, 7, [
        c("Day 15-16: UI System (Canvas, Buttons, Score)", 14, 2),
        c("Day 17-18: Sound Effects & Background Music", 16, 2),
        c("Day 19-20: Scene Management & Game States", 18, 2),
        c("Day 21: Final Project - Complete 2D Game", 20, 1),
      ]),
    ];

    case "t14": return [
      p("Week 1: Arduino Basics", 0, 7, [
        c("Day 1-2: Arduino IDE & Board Setup", 0, 2),
        c("Day 3-4: Digital I/O (LED, Button)", 2, 2),
        c("Day 5-6: Analog I/O (Potentiometer, Sensor)", 4, 2),
        c("Day 7: Lab - Traffic Light Simulation", 6, 1),
      ]),
      p("Week 2: Sensors & Communication", 7, 7, [
        c("Day 8-9: DHT11 (Suhu) & Ultrasonic Sensor", 7, 2),
        c("Day 10-11: Serial Communication & LCD Display", 9, 2),
        c("Day 12-13: Servo Motor & PWM Control", 11, 2),
        c("Day 14: Lab - Distance Meter with LCD", 13, 1),
      ]),
      p("Week 3: IoT Project", 14, 7, [
        c("Day 15-16: ESP8266/ESP32 & WiFi Setup", 14, 2),
        c("Day 17-18: Kirim Data ke Cloud (ThingSpeak)", 16, 2),
        c("Day 19-20: Mobile Dashboard & Remote Control", 18, 2),
        c("Day 21: Final Project - Smart Home Monitoring", 20, 1),
      ]),
    ];

    default: return [
      p("Week 1: Getting Started", 0, 7, [
        c("Day 1-3: Introduction & Setup", 0, 3),
        c("Day 4-7: Core Concepts", 3, 4),
      ]),
    ];
  }
}
