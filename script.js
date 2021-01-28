console.log('loaded');

//global counters (node and edge for ids)
var ngc = 0;
var egc = 0;

var cy = cytoscape({
	container: document.getElementById('cy'),

  // so we can see the ids
  style: [
    {
      selector: 'node',
      style: {
        'label': 'data(id)'
      }
    }
  ]

});

function addNode(resp) {
	var r = cy.add({group: 'nodes', data: {id:'n'+ngc,'response':resp}})

	ngc++;

   cy.layout({
	name: 'grid'
  }).run();

  return r;
}

function addEdge(s,t) {
	cy.add([{
		group: 'edges', data: { id: 'e'+egc, source: s, target: t } 
	}]);
	egc++;
}

ztReq('self')
ztReq('status')
ztReq('peer')
ztReq('network')
ztReq('moon')

cy.on('tap', 'node', function(evt){
	var node = evt.target;
	console.log(node.data());
	nd = node.data();
	var n = addNode(nd);
	addEdge('n0',nd.id);
	console.log( 'tapped ' + node.id() );
  });

cy.on('tap', function(event){
	// target holds a reference to the originator
	// of the event (core or element)
	var evtTarget = event.target;
  
	if( evtTarget === cy ){
	  console.log('tap on background');
	  
	} else {
	  console.log('tap on some element');
	}
  });

function ztReq(uri, type="GET") {
	fetch('http://127.0.0.1:9993/' + uri, {
		method: type,
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
	}).then(function (resp) {
		// This is the JSON from our response
		console.log(resp);
		var i = 0;
		for (var key in resp) {
			if (resp.hasOwnProperty(key)) {
				console.log(key + " -> " + resp[key]);
				addNode(resp);
			}
			i++;
		}
		document.getElementById('ztgui').innerHTML = JSON.stringify(resp);
	}).catch(function (err) {
		// There was an error
		console.warn('Something went wrong.', err);
	});
}

// curl -v --header "X-ZT1-Auth: $(cat /var/lib/zerotier-one/authtoken.secret)" 
// http://localhost:9993/controller/network/NETWORKID--data
//  '{"dns": {"domain": "
// INTERNAL.NET
// ", "servers": ["DNS SERVER"]}}'