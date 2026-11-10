import Db_connection from '../config/Mongodb.js';
import hackathonModel from '../models/hackathon_schema.js';

(async function seed(){
  try{
    Db_connection();

    const items = [
      {
        name: 'AI Innovation Challenge',
        description: 'Build AI-powered solutions for real-world industry challenges and push the limits of creativity.',
        price: 499,
        category: 'AI',
        createdBy: 'Admin',
        image: 'uploads/AI Innovation Challenge.webp'
      },
      {
        name: 'Full-Stack Code Clash',
        description: 'Build complete end-to-end applications that combine strong frontend, backend, and database skills.',
        price: 499,
        category: 'Full-Stack',
        createdBy: 'Admin',
        image: 'uploads/Full-Stack Code Clash.webp'
      },
      {
        name: 'Data Science Sprint',
        description: 'Work with real datasets and build predictive models that address meaningful problems.',
        price: 499,
        category: 'Data Science',
        createdBy: 'Admin',
        image: 'uploads/Data Science Sprint.webp'
      },
      {
        name: 'Frontend Sprint',
        description: 'Build clean, responsive, and high-performance interfaces using modern frontend tools.',
        price: 499,
        category: 'Frontend',
        createdBy: 'Admin',
        image: 'uploads/Frontend Sprint.webp'
      },
      {
        name: 'Mobile App Development',
        description: 'Build functional and user-ready mobile applications that solve practical problems.',
        price: 449,
        category: 'Mobile',
        createdBy: 'Admin',
        image: 'uploads/Mobile App Development.webp'
      },
      {
        name: 'UI/UX Design Challenge',
        description: 'Create intuitive, visually clear, and user-focused designs that improve real user experiences.',
        price: 449,
        category: 'Design',
        createdBy: 'Admin',
        image: 'uploads/UIUX Design Challenge.webp'
      },
      {
        name: 'Web Development Challenge',
        description: 'Build fast, reliable, and user-ready web applications using modern development practices.',
        price: 499,
        category: 'Web',
        createdBy: 'Admin',
        image: 'uploads/Web Development Challenge.webp'
      }
    ];

    for(const it of items){
      await hackathonModel.findOneAndUpdate({ name: it.name }, { $set: it }, { upsert: true });
      console.log('Seeded:', it.name);
    }

    console.log('Hackathon seeding complete');
    process.exit(0);
  }
  catch(err){
    console.error('Seeding failed', err);
    process.exit(1);
  }
})();
