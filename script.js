//sanity check
console.log('loaded');

//declarations
var cy = cytoscape({
	container: document.getElementById('cy'),

  // style definitions
  style: [
	{
		selector: 'core',
		style: {
		  'active-bg-color': '#990000'
		}
	  },
    {
      selector: 'node',
      style: {
		'label': 'data(name)',
		'color': '#889988',
		'background-color': '#223322',
		'shape': 'round-rectangle',
		'background-opacity':0.5
      }
	},
	{
		selector: 'edge',
		style: {
		  'label': 'data(id)',
		  'color': '#112211',
		  'background-color': '#555555',
		  'width':2,
		  'curve-style': 'unbundled-bezier'

		}
	  }
  ]});

//localdb
var db = {
	'i':{
		'n':0,
		'e':0
	},
	'x':25,'y':50,'g':50,
	'views':[
		'null', 'grid','circle','concentric','avsdf', //geometric
		'dagre', 'breadthfirst', 'concentric', 'elk', 'klay', //hirearchical
		'fcose', 'cose-bilkent', 'cose', 'cola', 'cise', 'euler', 'spread'//force-directed
	],
	'menuShown':false,
	'menuCollection':cy.collection()
};

// Global helpers
var ngc = db.i.n;
var egc = db.i.e;

function addNode(name, data={}, x=db.x, y=db.y) {
	var r = cy.add({group: 'nodes',
					data: {id:'n'+ngc, name:name, ...data},
					position: { x: x, y: y }})
	ngc++;
	return r;	
}


function addEdge(s,t) {
	cy.add([{
		group: 'edges', data: { id: 'e'+egc, source: s, target: t } 
	}]);
	egc++;
}

function grid() {
	cy.layout({name:'null'}).run()
	cy.layout({
		name: 'grid'
	  }).run();
}

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
				addNode(resp, uri);
			}
			i++;
		}
		// document.getElementById('ztgui').innerHTML = JSON.stringify(resp);
	}).catch(function (err) {
		// There was an error
		console.warn('Something went wrong.', err);
	});
}


var ztgui = addNode('ztgui', x=0, y=0)
ztgui.hide();
var menuNode = addNode('menu')
var gridNode = addNode('grid', {'type':'menu'})
var plusNode = addNode('+', {'type':'menu'})
db.menuCollection = cy.filter('node[type = "menu"]');

menuNode.on('tap', function(event){
	var m = db.menuCollection
	if(m.hidden()){
		m.show()
	} else {
		m.hide()
	}
});
gridNode.on('tap', function(event){
	grid();
});
plusNode.on('tap', function(event){
	addNode('newNode');
	grid();
});

// var menu = cy.add([
// 	{ group: 'nodes', data: { id: 'n0' }, position: { x: 100, y: 100 } },
// 	{ group: 'nodes', data: { id: 'n1' }, position: { x: 200, y: 200 } },
// 	{ group: 'edges', data: { id: 'e0', source: 'n0', target: 'n1' } }
//   ]);

// addNode({
// 	group: 'nodes', data: { id: 'n0' }, position: { x: 100, y: 100 }
// },'menu')

// ztReq('self')
// ztReq('status')
// ztReq('peer')
// ztReq('network')
// ztReq('moon')



// curl -v --header "X-ZT1-Auth: $(cat /var/lib/zerotier-one/authtoken.secret)" 
// http://localhost:9993/controller/network/NETWORKID--data
//  '{"dns": {"domain": "
// INTERNAL.NET
// ", "servers": ["DNS SERVER"]}}'