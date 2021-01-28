console.log('loaded');

function getStatus() {
	fetch('http://127.0.0.1:9993/status', {
		method: 'GET',
		headers: {
			'X-ZT1-Auth': '',
		},
		// mode: 'no-cors',
		referrer: 'no-referrer'
	}).then(function (response) {
		// The API call was successful!
		if (response.ok) {
			
			return response.json();
		} else {
			return Promise.reject(response);
		}
	}).then(function (data) {
		// This is the JSON from our response
		console.log(data);
		document.getElementById('ztgui').innerHTML = JSON.stringify(data);
	}).catch(function (err) {
		// There was an error
		console.warn('Something went wrong.', err);
	});
}

getStatus()