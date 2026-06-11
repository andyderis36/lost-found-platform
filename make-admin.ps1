# Script to create the first admin user
# Run this after you have registered a user account

# Get the email of the user you want to make admin
$email = Read-Host "Enter the email address of the user to make admin"

# MongoDB connection string (update if needed)
$mongoUri = Read-Host "Enter MongoDB connection string (press Enter for localhost)"
if ([string]::IsNullOrWhiteSpace($mongoUri)) {
    $mongoUri = "mongodb://localhost:27017/lost-found-platform"
}

Write-Host "`nUpdating user role to admin..." -ForegroundColor Yellow

# Create MongoDB command to update user role
$mongoCommand = @"
const { MongoClient } = require('mongodb');

async function updateUserRole() {
  const client = new MongoClient('$mongoUri');
  
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    
    const result = await users.updateOne(
      { email: '$email' },
      { `$set: { role: 'admin' } }
    );
    
    if (result.matchedCount === 0) {
      console.log('ERROR: User not found with email: $email');
    } else if (result.modifiedCount === 1) {
      console.log('SUCCESS: User role updated to admin');
      const user = await users.findOne({ email: '$email' });
      console.log('User:', JSON.stringify(user, null, 2));
    } else {
      console.log('INFO: User was already an admin');
    }
  } catch (error) {
    console.log('ERROR:', error.message);
  } finally {
    await client.close();
  }
}

updateUserRole();
"@

# Save the command to a temporary file
$tempFile = "temp-make-admin.js"
$mongoCommand | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "Executing MongoDB update..." -ForegroundColor Yellow

# Run the MongoDB command
node $tempFile

# Clean up
Remove-Item $tempFile

Write-Host "`nDone! If successful, you can now log out and log back in to see admin features." -ForegroundColor Green
Write-Host "The Admin Panel link will appear in the navbar." -ForegroundColor Green
