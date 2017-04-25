/* 	CreateMapEngine.js
	
	* This file builds the map(the city) on which the robots attack. It creates a 
	* graph which acts as the city by using the delaunay's triangulation algorithm.
	* The algorithm is used to generate a planar graph which is then built on the canvas
	* entity into a city using the images in our images folder. The whole game is created
	* on the canvas below which is made global so that it can be accessible in other
	* scripts.
*/

var Engine = (function(global) {
	/* canvas on which the map is to be drawn*/
	var doc = global.document, canvas = doc.createElement('canvas'), ctx = canvas.getContext('2d');  

	/*setting the height and width of the canvas*/
	canvas.width = 1200;
    canvas.height = 800;
    //canvas.style.backgroundColor = 'rgba(158, 167, 184, 0.2)';
    doc.body.appendChild(canvas);

	/*constructor function to create a objects with their definition in the function
	*/
	var Map = function(){

		/* coordinates property(data member) of the object */
		this.coordinates = [];
		this.coordinatesRow = [];
		this.minCost;
		this.Edges = [];

	};	

	/* member function of the class to draw the city of the map on to canvas */
	Map.prototype.drawVertices = function() {
		console.log("creating the nodes of the city on the canvas");
		for(k = 0; k < this.coordinates.length; k++) {	 
			// drawing the circle which are teh vertices of the graph
			ctx.beginPath();
			ctx.arc(this.coordinates[k][0],this.coordinates[k][1],20,0,2*Math.PI);
			if(k == 0 || k == 1 || k==2 || k == 4) {
				ctx.fillStyle="#0095DD";	
			} else {
				ctx.fillStyle="#FF0000";
			}
			ctx.fill();
			ctx.closePath();
			// ctx.font = "30px Arial";
   //  		ctx.fillStyle = "#0095DD";
   //  		ctx.fillText(k+1, this.coordinates[k][0], this.coordinates[k][1]);
		}
		console.log("completed");
	}

	/*function to create the roades of the city on the canvas
	*/
	Map.prototype.drawEdges = function() {
		for(j=0; j < this.Edges.length; j++) {
			if(this.Edges[j][2] != 0) {
				ctx.moveTo(this.coordinates[this.Edges[j][0]][0],this.coordinates[this.Edges[j][0]][1]);
				ctx.lineTo(this.coordinates[this.Edges[j][1]][0],this.coordinates[this.Edges[j][1]][1]);
				ctx.lineWidth = 10;
				ctx.stroke();
			}
		}
	}

	/*function to draw the a single triangle given by the delaunay's triangulation
	*/
	Map.prototype.drawTriangle = function(node1,node2,node3) {

		/* checking if all the vertices of the donot lie on the same row
		 * otherwise we may get triangle which are flattened that is acute angled
		 * which will be a bad triangle for the game */
		// if(this.coordinatesRow[node1] == this.coordinatesRow[node2] && this.coordinatesRow[node2] == this.coordinatesRow[node3])
		// 	return;
		// if(node1%4 == node2%4 && node2%4 == node3%4)
		// 	return;
		/* if the triangle is not bad then draw the triangle */
		ctx.moveTo(this.coordinates[node1][0],this.coordinates[node1][1]);
		ctx.lineTo(this.coordinates[node2][0],this.coordinates[node2][1]);
		ctx.stroke();
		ctx.lineTo(this.coordinates[node3][0],this.coordinates[node3][1]);
		ctx.stroke();
		ctx.lineTo(this.coordinates[node1][0],this.coordinates[node1][1]);
		ctx.stroke();
	}
	
	/* function to create random points on the canvas 
	 * which will act as coordinates of the nodes of the city
	 */
	Map.prototype.createVertices = function() {
		console.log("creating vertices");
		var h = 3, v = 2, minGap = 30;
		var minX = minGap, maxX = (canvas.width/h)-minGap, minY = minGap, maxY = (canvas.height/v)-minGap;
		for(m=0; m < v; m++){
			for(i=0; i < h; i++) {
				var vertex = [];
				console.log(minX + "," + maxX);
				vertex[0] = Math.floor((Math.random() * (maxX-minX)) + minX);
				console.log(minY + "," + maxY);
				vertex[1] = Math.floor((Math.random() * (maxY-minY)) + minY);
				this.coordinates.push(vertex);
				this.coordinatesRow.push(m+1);
				console.log("vertex : " + vertex[0] + "," + vertex[1]);
				minX = maxX + minGap;
				maxX = minX + (canvas.width/h)-minGap;
			}
			minY = maxY + minGap;
			maxY = minY + (canvas.height/v)-minGap;
			maxX = (canvas.width/h)-minGap;
			minX = minGap;
		}
	}

	/* calculates the edges of the graph and their corresponding weight 
	 * and stores them in the Edges array. */
	Map.prototype.createEdges = function(triangles) {
		for(i=0 ; i<triangles.length-2 ; i=i+3) {
			var u = [triangles[i],triangles[i+1],this.calculateWeight(this.coordinates[triangles[i]],this.coordinates[triangles[i+1]])];
			var v = [triangles[i+1],triangles[i+2],this.calculateWeight(this.coordinates[triangles[i+1]],this.coordinates[triangles[i+2]])];
			var w = [triangles[i+2],triangles[i],this.calculateWeight(this.coordinates[triangles[i+2]],this.coordinates[triangles[i]])];
			if(this.deleteDuplicate(u) == false) {
				this.Edges.push(u);
			}
			if(this.deleteDuplicate(v) == false) {
				this.Edges.push(v);
			}
			if(this.deleteDuplicate(w) == false) {
				this.Edges.push(w);
			}
		}
	}

	Map.prototype.deleteDuplicate = function(vertex) {
		for(c=0 ; c<this.Edges.length ; c++) {
			console.log(this.Edges[c][0]);
			if((this.Edges[c][0] == vertex[0] && this.Edges[c][1] == vertex[1]) || (this.Edges[c][1] == vertex[0] && this.Edges[c][0] == vertex[1])) {
				return true;			
			}
		}
		return false;
	}

	/* calculates the weight b/w two edges */
	Map.prototype.calculateWeight = function(v1,v2) {
		return ((Math.floor(Math.sqrt(Math.pow((v1[0]-v2[0]),2) + Math.pow((v1[1]-v2[1]),2)))%10)+1);
	}

	/* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that we can use it more easily
     * from within other scripts.
     */
	global.ctx = ctx;

	canvas.addEventListener('click', function(event) {
		console.log("Entered Event Listener");
		var x = event.pageX - canvas.offsetLeft, y = event.pageY - canvas.offsetTop; 
		console.log("x : " + x + " y : " + y);
		for(a=0 ; a<map.Edges.length ; a++) {
			//console.log("Entered the loop");
			var y1 = map.coordinates[map.Edges[a][0]][1], y2 = map.coordinates[map.Edges[a][1]][1], x1 = map.coordinates[map.Edges[a][0]][0], x2 = map.coordinates[map.Edges[a][1]][0];
			var m = (y1 - y2)/(x1 - x2);
			var distance = Math.abs(y - m*x + m*x2 - y2)/Math.sqrt(1 + m*m);
			console.log(distance);
			if(distance < 10) {
				if(map.minCost < map.Edges[a][2]) {
					alert("INSUFFICIENT FUNDS\n");
				} else {
				map.minCost-=map.Edges[a][2];
				map.Edges[a][2] = 0;
				createMap(); 
				drawCoins();	
				if(map.checkForWinning(map.Edges[a]) == false) {
					alert("YOU LOSE\n");
                	document.location.reload();
				}
				if(map.minCost == 0) {
					alert("YOU WIN\n");
					document.location.reload();
				}
			  }
			}			
		}
	},false);

	Map.prototype.showWeights = function() {
		for(j=0 ; j<this.Edges.length ; j++) {
			if(this.Edges[j][2] != 0) {
				a1 = this.coordinates[this.Edges[j][0]][0];
				a2 = this.coordinates[this.Edges[j][0]][1];
				b1 = this.coordinates[this.Edges[j][1]][0];
				b2 = this.coordinates[this.Edges[j][1]][1];
				ctx.font = "30px Arial";
				ctx.fillStyle = "#0095DD";
				ctx.fillText(this.Edges[j][2],(a1 + b1)/2,((b2 + a2)/2)-20,100);
			}
		}
	}

	Map.prototype.checkForWinning = function(edge) {
		var flag = 0;
		console.log("Entering checkForWinning");
		for(v=0 ; v<deleteEdges.length ; v++) {
			var edgeList = deleteEdges[v];
			if(edgeList[0].length>1) { 
			 	for(z=0 ; z<edgeList.length ; z++) {
			 		console.log("checking for multiple edgeList");
			 		if((edge[0] == edgeList[z][0] && edge[1] == edgeList[z][1]) || (edge[0] == edgeList[z][1] && edge[1] == edgeList[z][0])) {
			 			flag++;
			 		}
			 	}
			}
			else {
				console.log("checking for single edgeList");
				if((edge[0] == edgeList[0] && edge[1] == edgeList[1]) || (edge[0] == edgeList[1] && edge[1] == edgeList[0])) {
					flag++;
				}
			}
			}
		if(flag == 0) {
			return false;
		} else {
			return true;
		}
	}

	function createMap() {
		console.log("creating the map again");
		ctx.clearRect(0,0,canvas.width,canvas.height);
		map.drawVertices();
		map.drawEdges();
		map.showWeights();
	}

	function drawCoins() {
    	ctx.font = "30px Arial";
    	ctx.fillStyle = "#0095DD";
    	ctx.fillText("Coins: " + map.minCost, canvas.width-300, canvas.height-20);
	}

	/* creating the map instance of the class Map
	 * and calling its function to create the city on the canvas.
	 */ 
	var map = new Map();
	map.createVertices();
	map.drawVertices();
	console.log(map.coordinates);
	console.log(map.coordinatesRow);
	console.log("triangles : " + Delaunay.triangulate(map.coordinates));
	console.log(map.coordinates.length);
	console.log((Delaunay.triangulate(map.coordinates)).length);
	map.createEdges(Delaunay.triangulate(map.coordinates));
	map.drawEdges();
	map.showWeights();
	console.log(map.Edges);
	map.minCost = DestroyPath(6,3,map.Edges.length,map.Edges,[2,1,4,0]);	
	drawCoins();
	console.log("Mincost Map : " + map.minCost);
})(this);