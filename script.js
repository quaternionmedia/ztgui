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
		selector: 'node[type = "menu"]',
		style: {
		  'label': 'data(name)',
		  'color': '#889988',
		  'background-color': '#332233',
		  'shape': 'round-rectangle',
		  'background-opacity':0.5
		}
	  },
	  {
		selector: 'node[type = "response"]',
		style: {
		  'label': 'data(name)',
		  'color': '#889988',
		  'background-color': '#664433',
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
	'menuCollection':cy.collection(),
	'dataCollection':cy.collection()
};

// Global helpers
var ngc = db.i.n;
var egc = db.i.e;

function addNode(name, data={}, nx=db.x, ny=db.y, locked=false) {
	var r = cy.add({group: 'nodes',
					data: {id:'n'+ngc, name:name, ...data},
					position: { x: nx, y: ny },
					locked:locked})
	ngc++;

	if(r.type = 'data'){
		r.on('tap', function(event){
			addNode(JSON.stringify(r.data()))
		})
	}
	db.dataCollection.push(r)
	return r;	
}


function addEdge(s,t) {
	cy.add([{
		group: 'edges', data: { id: 'e'+egc, source: s, target: t } 
	}]);
	egc++;
}

function orderDisplay(layout='grid') {
	var options = {
		name: layout,
		animate: false, // whether to animate changes to the layout
		animationDuration: 50, // duration of animation in ms, if enabled
		animationEasing: false, // easing of animation, if enabled
		animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.
		  // All nodes animated by default for `animate:true`.  Non-animated nodes are positioned immediately when the layout starts.
		// eles: someCollection, // collection of elements involved in the layout; set by cy.layout() or eles.layout()
		fit: true, // whether to fit the viewport to the graph
		padding: 30, // padding to leave between graph and viewport
		pan: undefined, // pan the graph to the provided position, given as { x, y }
		ready: undefined, // callback for the layoutready event
		stop: undefined, // callback for the layoutstop event
		spacingFactor: 1, // a positive value which adjusts spacing between nodes (>1 means greater than usual spacing)
		transform: function (node, position ){ return position; }, // transform a given node position. Useful for changing flow direction in discrete layouts
		zoom: undefined // zoom level as a positive number to set after animation
	  }
	
	cy.filter('node[type != "menu"]').layout(options).run();
}

function orderMenu() {
	var omi = 1;
	var options = {
		name: 'concentric',
		fit: false,
		boundingBox: {x1:0,y1:0,x2:100,y2:100}
  		// positions: function(node){

		// 	  return {x:db.x+omi++*db.g,y:db.y}
		//   },
	  }
	
	cy.filter('node[type = "menu"]').layout(options).run();
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
		// console.log(resp);
		var i = 0;
		addNode(uri, {'type':'response', ...resp})
		for (var key in resp) {
			if (resp.hasOwnProperty(key)) {
				// console.log(key + " -> " + resp[key]);
				// console.log(resp, key, resp[key])
				addNode(uri, {'type':'data', ...resp[key]});
			}
			i++;
		}
		orderDisplay()
		orderMenu()
		// document.getElementById('ztgui').innerHTML = JSON.stringify(resp);
	}).catch(function (err) {
		// There was an error
		console.warn('Something went wrong.', err);
	});
}

function ztData() {
	ztReq('self')
	ztReq('status')
	ztReq('peer')
	ztReq('network')
	ztReq('moon')
}

ztData();


var ztgui = addNode('ztgui')
ztgui.hide();

var menuNode = addNode('menu', x=0, y=0)
menuNode.lock();
var omNode = addNode('order menu', {'type':'menu'})
var gridNode = addNode('grid', {'type':'menu'})
var plusNode = addNode('+', {'type':'menu'})

// addEdge(menuNode.id(), gridNode.id())
// addEdge(menuNode.id(), plusNode.id())
// addEdge(menuNode.id(), omNode.id())


db.menuCollection = cy.filter('node[type = "menu"]');


menuNode.on('tap', function(event){
	var m = db.menuCollection
	if(m.hidden()){
		m.show()
	} else {
		m.hide()
	}
});
omNode.on('tap', function(event){
	orderMenu();
})
gridNode.on('tap', function(event){
	orderDisplay();
});
plusNode.on('tap', function(event){
	addNode('newNode', {'type':'data'}, x=0, y=100);
});






// curl -v --header "X-ZT1-Auth: $(cat /var/lib/zerotier-one/authtoken.secret)" 
// http://localhost:9993/controller/network/NETWORKID--data
//  '{"dns": {"domain": "
// INTERNAL.NET
// ", "servers": ["DNS SERVER"]}}'