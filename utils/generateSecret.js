const crypto = require('crypto');
const fs = require('fs');
const path = require('path');


const generateJwtSecret = () => {
  
  const secret = crypto.randomBytes(64).toString('hex');
  return secret;
};


const updateEnvFile = (secret) => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    
    
    if (fs.existsSync(envPath)) {
      
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      
      if (envContent.includes('JWT_SECRET=')) {
        envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${secret}`);
      } else {
        envContent += `\nJWT_SECRET=${secret}`;
      }
      
      
      fs.writeFileSync(envPath, envContent);
      console.log('JWT_SECRET has been updated in .env file');
    } else {
      
      fs.writeFileSync(envPath, `JWT_SECRET=${secret}\n`);
      console.log('Created new .env file with JWT_SECRET');
    }
  } catch (error) {
    console.error('Error updating .env file:', error.message);
  }
};


const main = () => {
  const secret = generateJwtSecret();
  console.log('\n==== Generated JWT Secret ====');
  console.log(secret);
  console.log('============================\n');
  

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Do you want to update the JWT_SECRET in your .env file? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      updateEnvFile(secret);
    } else {
      console.log('JWT_SECRET was not updated in .env file. You can manually add it:');
      console.log(`JWT_SECRET=${secret}`);
    }
    readline.close();
  });
};

main();