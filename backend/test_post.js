const fs = require('fs');

async function testPostWithFile() {
  const form = new FormData();
  form.append('patientName', 'Test Name');
  form.append('age', '30');
  form.append('gender', 'Male');
  form.append('symptoms', 'Fever');
  
  // Create a dummy file
  fs.writeFileSync('dummy.pdf', 'dummy content');
  
  // Read using Blob for fetch
  const buffer = fs.readFileSync('dummy.pdf');
  const blob = new Blob([buffer], { type: 'application/pdf' });
  form.append('files', blob, 'dummy.pdf');
  
  try {
    console.log('Sending request with file...');
    const response = await fetch('http://localhost:5000/api/cases', {
       method: 'POST',
       body: form
    });
    console.log('Response Status:', response.status);
    const text = await response.text();
    console.log('Response Data:', text);
  } catch (error) {
    console.error('Request Error:', error.message);
  }
}

testPostWithFile();
