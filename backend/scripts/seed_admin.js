import Db_connection from '../config/Mongodb.js';
import userModel from '../models/user_schema.js';
import bcrypt from 'bcryptjs';

Db_connection();

const seed = async () => {
  try {
    const name = 'Skyinten';
    const email = 'admin1627@gmail.com';
    const password = '1144';
    const role = 'admin';

    const existing = await userModel.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);

    await userModel.create({ name, email, password: hashed, role });
    console.log('Admin user created:', email);
    process.exit(0);
  } catch (err) {
    console.error('Seeding admin error', err);
    process.exit(1);
  }
};

seed();
