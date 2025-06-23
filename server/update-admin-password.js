const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inncol', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@inncol.com' });
    
    if (!adminUser) {
      console.log('Admin user not found!');
      process.exit(1);
    }

    // Update the password - the pre-save hook will automatically hash it
    adminUser.password = 'za$8Tpgd+6Wy&3a';
    await adminUser.save();

    console.log('✅ Admin password updated successfully!');
    console.log('Email: admin@inncol.com');
    console.log('New password: za$8Tpgd+6Wy&3a');
    console.log('🔒 Password has been securely hashed and stored.');

  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

updateAdminPassword(); 