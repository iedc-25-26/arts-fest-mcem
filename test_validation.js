// import fetch from 'node-fetch'; // Using native fetch in Node v18+

const testValidation = async () => {
    try {
        const response = await fetch('http://localhost:3001/validate-admission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admissionNumbers: ['5498'] })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

testValidation();
