// import React, { useEffect } from "react";
// import "../styles/community.css";

// export default function Community() {
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//     const categories = [
//         { title: "Web Development", desc: "HTML, CSS, JS, React, Full-Stack discussions" },
//         { title: "Data Science & AI", desc: "Machine learning, deep learning, analytics topics" },
//         { title: "Cybersecurity", desc: "Network security, ethical hacking, and tools" },
//         { title: "Cloud & DevOps", desc: "AWS, Azure, CI/CD, Docker, Kubernetes" },
//         { title: "Interview Prep", desc: "DSA, system design, coding challenges" },
//         { title: "Career Guidance", desc: "Roadmaps, resume tips, job opportunities" }
//     ];

//     const posts = [
//         {
//             user: "Anil Bhukya",
//             question: "How do I prepare for a frontend developer interview?",
//             replies: 12,
//             time: "2 hours ago"
//         },
//         {
//             user: "Naveen",
//             question: "Which AWS certification should beginners choose?",
//             replies: 5,
//             time: "4 hours ago"
//         },
//         {
//             user: "Bhanu Prakash",
//             question: "Best resources to learn DSA from scratch?",
//             replies: 8,
//             time: "1 day ago"
//         },
//     ];

//     return (
//         <div className="community-wrapper">
//             <header className="community-header">
//                 <h1>Community Hub</h1>
//                 <p>Connect with learners, ask questions, share knowledge, and grow together.</p>
//                 <button className="ask-btn">Ask a Question</button>
//             </header>

//             <section className="community-categories">
//                 <h2>Categories</h2>
//                 <div className="category-grid">
//                     {categories.map((cat, i) => (
//                         <div key={i} className="category-card">
//                             <h3>{cat.title}</h3>
//                             <p>{cat.desc}</p>
//                         </div>
//                     ))}
//                 </div>
//             </section>

//             <section className="community-posts">
//                 <h2>Recent Discussions</h2>

//                 {posts.map((p, i) => (
//                     <div key={i} className="post-card">
//                         <h3>{p.question}</h3>
//                         <p className="post-meta">
//                             Asked by <strong>{p.user}</strong> · {p.time} · {p.replies} replies
//                         </p>
//                     </div>
//                 ))}
//             </section>
//         </div>
//     );
// }
