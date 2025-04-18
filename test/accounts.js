const API_URL = process.env.API_URL || 'http://localhost:3000';

const assert = require('assert');
describe('register/login', function () {
	it('should not be able to delete invalid account', async function() {
		// NOTE: because this test intentionally makes an invalid request,
		// there will be one error message on the server logs
		// every time you run this test
		const response = await fetch(`${API_URL}/deleteOwnAccount`, {
			method: "DELETE",
			body: JSON.stringify({
				token: "does_not_exist"
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		});
		if (response.ok) {
			const json = await response.json();
			assert.equal(false, json.success);
		}
	});

	it('should be able to create & delete account', async function() {
		// create the account
		const response1 = await fetch(`${API_URL}/register`, {
			method: "POST",
			body: JSON.stringify({
				username: "testusername_createdeleteautotest",
				password: "testpass",
				name: "testname",
				email: "testusername_createdeleteautotest@example.com",
				phone: "5555551234"
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		});
		if (!response1.ok) {
			throw new Error(`Error: ${response1.status} - ${response1.statusText}`);
		}

		const json1 = await response1.json();
		assert.equal(true, json1.success);

		// attempt to delete the account
		const response2 = await fetch(`${API_URL}/deleteOwnAccount`, {
			method: "DELETE",
			body: JSON.stringify({ token: json1.token }),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		});
		if (!response2.ok) {
			throw new Error(`Error: ${response2.status} - ${response2.statusText}`);
		}

		const json2 = await response2.json();
		assert.equal(true, json2.success);
	});

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

		const json = await response.json();
		assert.equal(true, json.success);
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

		const json1 = await response1.json();
		assert.equal(true, json1.success);

		const response2 = await fetch(`${API_URL}/userdata`, {
			method: "POST",
			body: JSON.stringify({ token: json1.token }),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		});
		if (!response2.ok) {
			throw new Error(`Error: ${response2.status} - ${response2.statusText}`);
		}

		const json2 = await response2.json();
		assert.equal("testuser", json2.username);
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

		const json = await response.json();
		assert.equal(false, json.success);
	});


});
