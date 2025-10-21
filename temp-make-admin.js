const { MongoClient } = require('mongodb');

async function makeAdmin() {
  const client = new MongoClient('mongodb://localhost:27017/lost-found-platform');
  
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    
    const result = await users.updateOne(
      { email: 'andyderis33@gmail.com' },
      { $set: { role: 'admin' } }
    );
    
    if (result.matchedCount === 0) {
      console.log('❌ ERROR: User not found');
    } else if (result.modifiedCount === 1) {
      console.log('✅ SUCCESS: User role updated to admin\n');
      const user = await users.findOne({ email: 'andyderis33@gmail.com' });
      console.log('User details:');
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- Role:', user.role);
      console.log('\n🎉 User is now an admin!');
      console.log('\n📝 Next steps:');
      console.log('1. Log out from the app');
      console.log('2. Log in again with this account');
      console.log('3. You will see "⚡ Admin" link in the navbar');
    } else {
      console.log('ℹ️  INFO: User was already an admin');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  } finally {
    await client.close();
  }
}

makeAdmin();
