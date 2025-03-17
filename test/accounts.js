const API_URL = process.env.API_URL || 'http://localhost:3000';

const assert = require('assert');
describe('register/login', function () {
	it('should be able to login to existing account', async function() {
		const response = await fetch(`${API_URL}/login`, {
		    method: "POST",
		    body: JSON.stringify({
			username: "testuser",
			password: "testpass"
		    }),
		    headers: {
			"Content-type": "application/json; charset=UTF-8"
		    }
		});
		if (!response.ok) {
		    throw new Error(`Error: ${response.status} - ${response.statusText}`);
		}

		response.json().then(json => assert.equal(true, json.success));
	});

	it('login should get correct token', async function() {
		const response1 = await fetch(`${API_URL}/login`, {
		    method: "POST",
		    body: JSON.stringify({
			username: "testuser",
			password: "testpass"
		    }),
		    headers: {
			"Content-type": "application/json; charset=UTF-8"
		    }
		});
		if (!response1.ok) {
		    throw new Error(`Error: ${response1.status} - ${response1.statusText}`);
		}

		return response1.json();

		const response2 = await fetch(`${API_URL}/userdata`, {
		    method: "POST",
		    body: JSON.stringify({ token: response1.token }),
		    headers: {
			"Content-type": "application/json; charset=UTF-8"
		    }
		});
		if (!response2.ok) {
		    throw new Error(`Error: ${response2.status} - ${response2.statusText}`);
		}

		response2.json().then(json => assert.equal("testuser", json.username));
	});

	it('should not be able to login with wrong password', async function() {
		const response = await fetch(`${API_URL}/login`, {
		    method: "POST",
		    body: JSON.stringify({
			username: "testuser",
			password: "wrongpass"
		    }),
		    headers: {
			"Content-type": "application/json; charset=UTF-8"
		    }
		});
		if (!response.ok) {
		    throw new Error(`Error: ${response.status} - ${response.statusText}`);
		}

		response.json().then(json => assert.equal(false, json.success));
	});


});
