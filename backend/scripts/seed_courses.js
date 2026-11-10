import Db_connection from '../config/Mongodb.js';
import courseModel from '../models/course_schema.js';

Db_connection();

const seed = async () => {
  try {
    const placeholderImage = 'uploads/default-course.jpg';
    const courses = [
      { name: 'Frontend Development Bootcamp', description: 'Learn modern frontend development', image: "uploads/Frontend Development Bootcamp.jpg", price: 2499, duration: 60, category: 'frontend', createdBy: 'system' },
      { name: 'Python Programming', description: 'Python programming', image: "uploads/Python Programming.webp", price: 2499, duration: 60, category: 'python', createdBy: 'system' },
      { name: 'Java Programming', description: 'Java and Spring', image: "uploads/Java Programming.webp", price: 2499, duration: 60, category: 'java', createdBy: 'system' },
      { name: 'Cyber Security', description: 'Cybersecurity skills', image: "uploads/Cyber Security.webp", price: 2499, duration: 60, category: 'security', createdBy: 'system' },
      { name: 'DevOps', description: 'DevOps and CI/CD', image: "uploads/DevOps.webp", price: 2499, duration: 60, category: 'devops', createdBy: 'system' },
      { name: 'Data Analyst', description: 'Data analysis with Python', image: "uploads/Data Analyst.webp", price: 2499, duration: 60, category: 'data', createdBy: 'system' },
      { name: 'Full-Stack Web Development Bootcamp', description: 'Full-stack web development', image: "uploads/Full-Stack Web Development Bootcamp.webp", price: 2499, duration: 120, category: 'fullstack', createdBy: 'system' },
      { name: 'Cloud Computing', description: 'Cloud fundamentals', image: "uploads/Cloud Computing.webp", price: 2499, duration: 60, category: 'cloud', createdBy: 'system' },
      { name: 'Digital Marketing', description: 'Marketing skills', image: "uploads/Digital Marketing.webp", price: 2499, duration: 40, category: 'marketing', createdBy: 'system' },
      { name: 'Startup & Entrepreneurship', description: 'Startup skills', image: "uploads/Startup & Entrepreneurship.webp", price: 2499, duration: 40, category: 'startup', createdBy: 'system' },
      { name: 'Backend Development Bootcamp', description: 'Backend engineering', image: "uploads/Backend Development Bootcamp.webp", price: 2499, duration: 60, category: 'backend', createdBy: 'system' },
      { name: 'AI Robotics', description: 'AI and robotics', image: "uploads/AI Robotics.webp", price: 2499, duration: 90, category: 'ai', createdBy: 'system' },
    ];

    for (const c of courses) {
      const exists = await courseModel.findOne({ name: c.name });
      if (!exists) {
        await courseModel.create(c);
        console.log('Inserted course:', c.name);
      } else {
        console.log('Course exists:', c.name);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
};

seed();
