const axios = require('axios');

const testContributorRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/contributor/register', {
      basicInfo: {
        email: 'test@example.com',
        displayName: 'Test Contributor',
        bio: 'Test bio',
        walletAddress: '0x1234567890123456789012345678901234567890',
        website: 'https://github.com/test',
        x: 'https://twitter.com/test',
        telegram: 'https://t.me/test'
      },
      skills: {
        primarySkills: [
          {
            name: 'JavaScript',
            level: 'intermediate'
          },
          {
            name: 'Node.js',
            level: 'intermediate'
          }
        ]
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    console.error('Full error:', error);
  }
};

testContributorRegistration(); 