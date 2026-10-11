/**
 * Filter categories for the projects grid. Keep this list short (6-7
 * max) — "All" plus a handful of real buckets. A category with no
 * matching projects still shows in the filter bar but renders an
 * empty state rather than being hidden, so it's honest about what's
 * actually built so far.
 */
export const PROJECT_CATEGORIES = [
  "All",
  "Full Stack",
  "Frontend",
  "Backend",
  "UI/UX",
  "Other",
];

/**
 * Project data — DUMMY CONTENT.
 *
 * Riththi is passing placeholder data for now; once the admin dashboard
 * (Phase 16) and backend (Phase 13-15) are built, this file's shape stays
 * the same but the values get fetched from MongoDB instead of hardcoded
 * here. Keep any new project's shape consistent with these four so the
 * swap-over is a drop-in replacement, not a rewrite.
 */
export const projects = [
  {
    slug: "realtime-chat-application",
    title: "Real-Time Chat Application",
    category: "Full Stack",
    //featured: true,
    image: null, // e.g. "/projects/realtime-chat-application.png" once you have a real screenshot
    description:
      "A modern real-time communication platform with authentication, private conversations, online presence and instant messaging.",
    stack: ["Next.js", "Node.js", "Express", "MongoDB", "Socket.IO"],
    githubUrl: "https://github.com/your-username/realtime-chat-application",
    liveUrl: "",
    year: 2025,
    caseStudy: {
      metrics: [
        { label: "Messaging", value: "Real-Time", caption: "WebSocket-based delivery" },
        { label: "Presence", value: "Live", caption: "Online/offline tracking" },
        { label: "Auth", value: "JWT", caption: "Token-based sessions" },
        { label: "Storage", value: "MongoDB", caption: "Persistent chat history" },
      ],
      overview:
        "A real-time messaging platform built to explore how a Next.js frontend and an Express/Socket.IO backend can work together to deliver instant, reliable communication between users.",
      problem:
        "Most simple chat demos either skip authentication entirely or don't handle presence and reconnects well, making them unusable for anything beyond a toy example.",
      goal:
        "Build a chat application that feels production-ready: authenticated users, private conversations, live online/offline presence, and messages that arrive instantly without a page refresh.",
      solution:
        "Used Socket.IO on top of an Express server for bidirectional real-time events, paired with JWT-based authentication so every socket connection is tied to a verified user. MongoDB stores conversations and message history, while presence state is tracked in-memory and broadcast on connect/disconnect.",
      features: [
        "Email/password authentication with JWT sessions",
        "One-to-one private conversations",
        "Live online/offline presence indicators",
        "Real-time message delivery via WebSockets",
        "Typing indicators and message timestamps",
        "Persistent chat history stored in MongoDB",
      ],
      techStack: {
        frontend: ["Next.js", "React", "Tailwind CSS", "Socket.IO Client"],
        backend: ["Node.js", "Express.js", "Socket.IO", "JSON Web Tokens"],
        database: ["MongoDB", "Mongoose"],
      },
      architecture: {
        summary:
          "A standard client-server split, with a persistent WebSocket connection layered alongside the normal REST API for anything that needs to happen instantly.",
        layers: [
          "Client — Next.js app, maintains a live Socket.IO connection",
          "API — Express REST endpoints for auth, users, conversation history",
          "Realtime — Socket.IO server broadcasting message and presence events",
          "Database — MongoDB storing users, conversations, and messages",
        ],
      },
      process: [
        { title: "Planning", description: "Mapped out the data model for users, conversations, and messages before writing any UI." },
        { title: "Backend first", description: "Built authentication and the REST API, then layered Socket.IO on top for real-time events." },
        { title: "Frontend", description: "Built the chat UI in Next.js, wiring socket events to React state for live updates." },
        { title: "Testing", description: "Tested with multiple concurrent sessions to confirm presence and delivery stayed accurate under reconnects." },
      ],
      challenges: [
        {
          challenge: "Keeping presence state accurate when a user has multiple tabs open or drops connection unexpectedly.",
          solution: "Tracked connections per user (not per socket) so presence only flips to offline once every one of a user's sockets has disconnected.",
        },
        {
          challenge: "Authenticating WebSocket connections without exposing the JWT insecurely.",
          solution: "Passed the token during the Socket.IO handshake and verified it server-side before allowing the connection to join any rooms.",
        },
      ],
      results: [
        "Delivered a working real-time chat system with authenticated, private conversations.",
        "Messages and presence updates propagate to connected clients with no page refresh.",
        "Established a reusable pattern for combining REST and WebSocket layers in the same Express app.",
      ],
      screenshots: [],
    },
  },
  {
    slug: "ecommerce-platform",
    title: "E-Commerce Platform",
    category: "Full Stack",
    image: null, // e.g. "/projects/realtime-chat-application.png" once you have a real screenshot
    description:
      "A full-stack shopping platform with authentication, product management, cart functionality and an admin dashboard.",
    stack: ["React", "Node.js", "Express", "MongoDB"],
    githubUrl: "https://github.com/your-username/ecommerce-platform",
    liveUrl: "",
    year: 2025,
    caseStudy: {
      metrics: [
        { label: "Roles", value: "2", caption: "Customer & Admin" },
        { label: "Auth", value: "JWT", caption: "Secured user sessions" },
        { label: "Catalog", value: "Dynamic", caption: "Category-based products" },
        { label: "Data", value: "MongoDB", caption: "Orders, carts, products" },
      ],
      overview:
        "A complete online storefront covering the full purchase flow — browsing, cart, checkout — plus an admin side for managing products and orders.",
      problem:
        "Building an e-commerce flow end-to-end (not just a product list) requires getting cart state, order records, and admin permissions right at the same time — a good exercise in tying multiple user roles to one data model.",
      goal:
        "Build a shopping platform where customers can browse and purchase, and admins can manage the catalog and view orders, all on one shared backend.",
      solution:
        "Modeled products, carts, and orders as separate MongoDB collections linked by user ID. Cart state persists server-side so it survives across sessions and devices, and role-based middleware on the Express API restricts admin routes to admin accounts only.",
      features: [
        "User registration and login with JWT authentication",
        "Product catalog with categories and search",
        "Persistent shopping cart tied to the logged-in user",
        "Checkout flow producing a stored order record",
        "Admin dashboard for managing products",
        "Order history view for both customers and admins",
      ],
      techStack: {
        frontend: ["React", "Tailwind CSS", "Axios"],
        backend: ["Node.js", "Express.js", "JSON Web Tokens"],
        database: ["MongoDB", "Mongoose"],
      },
      architecture: {
        summary:
          "A single Express API serving both the customer-facing store and the admin dashboard, differentiated by role-based route guards.",
        layers: [
          "Client — React SPA for browsing, cart, and checkout",
          "API — Express REST endpoints for products, cart, and orders",
          "Auth — JWT middleware with role-based access (customer / admin)",
          "Database — MongoDB storing users, products, carts, and orders",
        ],
      },
      process: [
        { title: "Data modeling", description: "Designed the Product, Cart, and Order schemas before building any routes." },
        { title: "Core API", description: "Built and tested the product and cart endpoints first, since everything else depends on them." },
        { title: "Storefront UI", description: "Built the customer-facing React app against the working API." },
        { title: "Admin dashboard", description: "Added a role-gated admin view for managing products and reviewing orders." },
      ],
      challenges: [
        {
          challenge: "Keeping cart state consistent when a user adds items while logged out versus logged in.",
          solution: "Cart is always tied to the authenticated user server-side, so guests are prompted to log in before checkout rather than merging anonymous cart state.",
        },
        {
          challenge: "Preventing customers from accessing admin-only routes.",
          solution: "Added Express middleware that checks a user's role claim from their JWT before allowing access to any /admin route.",
        },
      ],
      results: [
        "Built a complete purchase flow from product browsing through to a stored order.",
        "Admin and customer roles share one backend with clean route-level separation.",
        "Cart and order data persist reliably across sessions.",
      ],
      screenshots: [],
    },
  },
  {
    slug: "learning-management-system",
    title: "Learning Management System",
    category: "Full Stack",
image: null, // e.g. "/projects/realtime-chat-application.png" once you have a real screenshot
    description:
      "A platform for managing courses, students, instructors, assignments and learning resources.",
    stack: ["Next.js", "Node.js", "MongoDB"],
    githubUrl: "https://github.com/your-username/learning-management-system",
    liveUrl: "",
    year: 2026,
    caseStudy: {
      metrics: [
        { label: "Roles", value: "2", caption: "Student & Instructor" },
        { label: "Content", value: "Course-based", caption: "Structured learning paths" },
        { label: "Assignments", value: "Tracked", caption: "Submission & review" },
        { label: "Data", value: "MongoDB", caption: "Courses & enrollments" },
      ],
      overview:
        "An LMS covering the core workflow of a course-based platform: instructors create courses and assignments, students enroll and submit work.",
      problem:
        "Education platforms need to support two very different user experiences — instructors managing content, and students consuming it — without duplicating logic across two separate apps.",
      goal:
        "Build a single platform where instructors can create and manage courses/assignments, and students can enroll, view materials, and submit work.",
      solution:
        "Used a single Next.js app with role-based views: instructors see course management screens, students see enrollment and submission screens, both driven by the same underlying course/assignment data model.",
      features: [
        "Course creation and management for instructors",
        "Student enrollment in available courses",
        "Assignment creation, submission, and tracking",
        "Learning resource uploads per course",
        "Role-based views for students vs. instructors",
      ],
      techStack: {
        frontend: ["Next.js", "React", "Tailwind CSS"],
        backend: ["Node.js", "Express.js"],
        database: ["MongoDB", "Mongoose"],
      },
      architecture: {
        summary:
          "Course, enrollment, and assignment data live in MongoDB, with the Next.js frontend rendering different views depending on the logged-in user's role.",
        layers: [
          "Client — Next.js app with role-aware routing (student / instructor)",
          "API — Express endpoints for courses, enrollments, and assignments",
          "Database — MongoDB storing courses, users, enrollments, and submissions",
        ],
      },
      process: [
        { title: "Role modeling", description: "Defined what students and instructors each needed to see before building any screens." },
        { title: "Course + assignment API", description: "Built the core data endpoints shared by both roles." },
        { title: "Instructor tools", description: "Built course and assignment management screens." },
        { title: "Student experience", description: "Built enrollment, course viewing, and submission flows." },
      ],
      challenges: [
        {
          challenge: "Avoiding duplicated logic between the instructor and student views of the same course data.",
          solution: "Built shared data-fetching functions that both views call, differing only in which UI components render the result.",
        },
      ],
      results: [
        "Delivered a working two-role platform (student / instructor) on one shared codebase.",
        "Instructors can create courses and assignments that students can immediately enroll in and complete.",
      ],
      screenshots: [],
    },
  },
  {
    slug: "finance-management-system",
    title: "Finance Management System",
    category: "Full Stack",
image: null, // e.g. "/projects/realtime-chat-application.png" once you have a real screenshot
    description:
      "A personal finance application for tracking income, expenses, budgets and financial reports.",
    stack: ["React", "Node.js", "MongoDB"],
    githubUrl: "https://github.com/your-username/finance-management-system",
    liveUrl: "",
    year: 2026,
    caseStudy: {
      metrics: [
        { label: "Tracking", value: "Category-based", caption: "Income & expenses" },
        { label: "Budgets", value: "Monthly", caption: "Per-category limits" },
        { label: "Reports", value: "Aggregated", caption: "MongoDB pipelines" },
        { label: "Data", value: "MongoDB", caption: "Transactions & budgets" },
      ],
      overview:
        "A personal finance tracker for logging income and expenses, setting budgets, and reviewing spending over time.",
      problem:
        "Personal finance tools often either oversimplify (a plain list of transactions) or overwhelm (full accounting software). The goal was something useful without being complicated.",
      goal:
        "Build a tool to log income/expenses, set category budgets, and see where money is actually going, without needing a finance background to use it.",
      solution:
        "Structured transactions with a category field, let users define a monthly budget per category, and built simple visual breakdowns so spending patterns are easy to see at a glance.",
      features: [
        "Income and expense tracking with categories",
        "Monthly budget setting per category",
        "Visual breakdown of spending by category",
        "Financial summary reports over custom date ranges",
      ],
      techStack: {
        frontend: ["React", "Tailwind CSS"],
        backend: ["Node.js", "Express.js"],
        database: ["MongoDB", "Mongoose"],
      },
      architecture: {
        summary:
          "A straightforward REST API over MongoDB, with the React frontend doing the aggregation work needed to turn raw transactions into visual reports.",
        layers: [
          "Client — React app for entry, budgets, and reports",
          "API — Express endpoints for transactions and budgets",
          "Database — MongoDB storing transactions, categories, and budgets",
        ],
      },
      process: [
        { title: "Data model", description: "Defined transaction and budget schemas around categories, since everything else builds on that." },
        { title: "Entry flow", description: "Built income/expense entry before anything else, so there was real data to report on." },
        { title: "Budgets", description: "Added per-category monthly budgets and simple over/under indicators." },
        { title: "Reporting", description: "Built date-range summaries and category breakdowns on top of the existing transaction data." },
      ],
      challenges: [
        {
          challenge: "Deciding how to aggregate transactions into reports without over-fetching data on every page load.",
          solution: "Used MongoDB aggregation pipelines to compute category totals server-side instead of pulling raw transactions to the client.",
        },
      ],
      results: [
        "Built a working income/expense tracker with category-based budgeting.",
        "Users can see a visual breakdown of spending without manually tallying transactions.",
      ],
      screenshots: [],
    },
  },
];

export function getAllProjectSlugs() {
  return projects.map((p) => p.slug);
}

export function getProjectBySlug(slug) {
  return projects.find((p) => p.slug === slug) ?? null;
}