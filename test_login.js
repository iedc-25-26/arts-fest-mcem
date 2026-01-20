
const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:3002/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admissionNumber: '5205' })
        });
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testLogin();
