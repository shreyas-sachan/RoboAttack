var NoOfEdges;
var minTime = 0; /* Minimum time required to destroy the paths */

/* function to make every vertex into a set*/
function MakeSet(v) {
	var NewGraph = [];
	for(i=0 ; i<v ; i++) {
		var ob = { parent : i, /* parent is the vertex to which the present vertex is connected
								* that is there is an edge b/w present vertex and the parent */
				   data : i, /* stores the vertex id number */
				   rank : 0, /* a flag which tells whether the vertex contains robot or not
				   			  * if it contains robot then flag > 0 else flag = 0*/
				   weight : 0, /* stores the weight of the edge b/w the vertex and the parent vertex*/
				   p : i /* p is the representative element of the set */
			};
		NewGraph.push(ob);
	}
	console.log(NewGraph);
	return NewGraph;
}

/* Merge Sort : to sort the Robot Positions for searching for robots
 * using binary search. */
function mergeSort(arr)
{
    if (arr.length < 2)
        return arr;
 
    var middle = parseInt(arr.length / 2);
    var left   = arr.slice(0, middle);
    var right  = arr.slice(middle, arr.length);
 
    return merge(mergeSort(left), mergeSort(right));
}
 
function merge(left, right)
{
    var result = [];
 
    while (left.length && right.length) {
        if (left[0] <= right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());
 
    while (right.length)
        result.push(right.shift());
 
    return result;
}

/**
 * Performs a binary search on the host array. This method can either be
 * injected into Array.prototype or called with a specified scope like this:
 * binaryIndexOf.call(someArray, searchElement);
 *
 * @param {*} searchElement The item to search for within the array.
 * @return {Number} The index of the element which defaults to -1 when not found.
 */
function binaryIndexOf(searchElement) {
    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;
 
    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];
 
        if (currentElement < searchElement) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > searchElement) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }
 
    return -1;
}

/* to find the representative element of the set */
function FindSet(vertex,NewGraph) {
	var ptr = NewGraph[vertex];
	console.log(ptr);
	while(ptr.p != ptr.data){
		ptr = NewGraph[ptr.p];
	}
	return ptr.data;
}

/* function to join two sets. It joins the second set(v) to the end of the first set(u)
 * @u,@v is the edge which is to be joined and an edge from the set containing
 * v is to be deleted. @p is the representative element of the first set to which
 * the part of second set is to be joined */
function Unite(NewGraph,u,v,w,p) {
	var weight, weight1 = w;
	var ptr1 = NewGraph[u];
	var ptr = NewGraph[v];
	var temp;
	/* loop which attaches each element of the second set to the 
	 * first set untill we get broken edge which has its weight set to 0
	 * and it parent point to itself */
	while(ptr.data != ptr1.data) {  
		temp = NewGraph[ptr.parent];
		weight = weight1;
		weight1 = ptr.weight;
		ptr.parent = ptr1.data;
		ptr.p = p; /* setting the representative element of element in the second set
					* to the representative element of the first set*/
		ptr.weight = weight;
		ptr1 = ptr;
		ptr = temp;
	}
}

/* function to check whether the given point(@v) contains robot or not
 * @RobotPosition is an array storing the positions of the robots and k is its size
 * Function returns 1 if robot is present otherwise returns 0
 */
function CheckRobot(v,RobotPosition,k,NewGraph) { 
	console.log(RobotPosition);
	if(NewGraph[v].rank > 0)  /* as rank > 0 it contains robot*/
		return 1;             
	else {
		if(binaryIndexOf.call(RobotPosition,v) != -1){
			NewGraph[v].rank+=1;  /* if contains robot, then increasing flag(rank) by one*/
			return 1;
		}
	}
	return 0;
} 

/* function to find the minimum weight edge between the robots contained 
 * by the set(containing u) and the set(containing v). @u, @v is an edge 
 * weight @w, which will be joined if w is not the minimum weight or else
 * it will be deleted. If u and v is not the minimum weight edge then 
 * then the function will find the minimum weight edge and delete it.
 * @p1, @p2 are the representative element of the sets containing u and v
 * respectively. */
function FindMin(u,v,w,NewGraph,p1,p2) {
	var min = w, data;
	var ptr1, ptr2;
	ptr1 = NewGraph[u];
	ptr2 = NewGraph[v];
	var j = 0; /* flag to check whether the min weight edge is on the
				* set(containing u) or the set(containing v).
				* if j>0 then it is on Sets[v]*/

	/* loop to find the minimum weight edge in set(containing u) */

	while(ptr1.parent != ptr1.data) {
		if(ptr1.weight < min) {
			min = ptr1.weight;
			data = ptr1.data;
		}
		ptr1 = ptr1.parent;
	}

	/* loop to find the edge which has the weight less than w or any edge
	 * in the set(containing u). */
	while(ptr2.parent != ptr2.data) {
		if(ptr2.weight < min) {
			min = ptr2.weight;
			data = ptr2.data;
			j++;  /* if minimum weight edges is in set(containing v),then
				   * increase j by 1.*/
		}
		ptr2 = ptr2.parent;
	}

	/* if minimum weight edge has weight w, then return w and donot join edge
	 * u,v. */
	if(min === w) {
		return w;
	}

	/* if minimum weight edge has weight less than w, then delete the edge*/
	else {
		NewGraph[data].parent = NewGraph[data];
		NewGraph[data].weight = 0;

		/* if j>0 which means the set(containing v) has the minimum weight edge
		 * so join the set(containing v) to the set(containing v) otherwise do vise-versa*/
		if(j>0) {
			Unite(NewGraph,u,v,p1)
		}
		else {
			Unite(NewGraph,u,v,p2);
		}
	}
	return min;
}

/* function to join the edge @u,@v which has the weight @w by checking whether
 * set(containing u) and set(containing v) has robots or not. If both the sets
 * contain robots, then delete the minimum weight edge by calling the FindMin 
 * function else join the two vertex @u, @v by calling Unite function */
function Union(u,v,NewGraph,w,RobotPosition,k) {
	/* finding the representative elements */
	var p1 = FindSet(u,NewGraph), p2 = FindSet(v,NewGraph);

	if(p1 === p2) {   /* it is the case when multiple paths exist b/w two cities */
		/* In this case instead of creating the given edge, we add the weight of the 
		 * edge to every edge which creates a parallel path to that edge. */
		var ptr = NewGraph[u];
		var flag = 0;  /* flag to check whether v comes first in the set or u. 
						* if flag>0 then v comes first else u comes first. */
		while(ptr.data != ptr.parent) {   //checking whether v comes first or u.  
			ptr = NewGraph[ptr.parent];
			if(ptr.data === v) {
				flag++;
				break;
			}
		}
		/* adding the weight of the current edge to other edges by considering which
		 * vertex comes first. */
		if(flag>0) {
			var ptr1 = NewGraph[u];
			while(ptr1.data != v) {
				ptr1.weight += w;
				ptr1 = NewGraph[ptr1.parent];
			}
		} else {
			var ptr2 = NewGraph[v];
			while(ptr2.data != u) {
				ptr2.weight += w;
				ptr2 = NewGraph[ptr2.parent];
			}
		}
		return;
	}

	/* checking for Robots */
	var c1 = CheckRobot(p1,RobotPosition,k,NewGraph);
	var c2 = CheckRobot(p2,RobotPosition,k,NewGraph);
	if(c1 && c2) {
		/* if both contain robots, then delete path */
		minTime += FindMin(u,v,w,NewGraph,p1,p2);
	}

	else if(c1) {
		/* if one of them contains robot then add the set which doesnot contain
		 * robot to the set which contains robot. This way we will always be keeping
		 * the vertex which contains robot at the top of the set. */
		Unite(NewGraph,u,v,w,p1);
	}
		else {
		/* else join the sets in any order */
		Unite(NewGraph,v,u,w,p2);
	}
}

/* function to check all the edges and join those which donot form a path b/w any two
 * robots through union function. It is the main function which needs to be called to 
 * delete the paths and find the minimum time. All other functions are called through it.
 * @n is the no of vertices which is required to make set for each vertex initially.
 * @Edges is array of all the edges of the graph through which the function will iterate.
 * @RobotPosition is an array storing the position vertex of the robots.
 * @k is the no of robots.*/
function Divide(n,Edges,RobotPosition,k) {
	var NewGraph = MakeSet(n);
	var u, v, w;

	for(i=0;i<NoOfEdges;i++) {
		u = Edges[i][0]; console.log("u :"+u);
		v = Edges[i][1]; console.log("v:"+v);
		w = Edges[i][2]; console.log("w:"+w);
		Union(u,v,NewGraph,w,RobotPosition,k);
	}
}












var n, k;
n = 5;//window.prompt("Enter n ");
k = 2;//window.prompt("Enter k ");;
NoOfEdges = 7;//window.prompt("Enter NoOfEdges ");
var Edges = [[1,0,1],[1,2,1],[2,3,2],[3,1,1],[3,0,2],[2,0,2],[0,4,12]];
// for(m=0;m<NoOfEdges;m++) {
// 	var edge = [];
// 	edge[0] = window.prompt("Enter v1 ");
// 	edge[1] = window.prompt("Enter v2 ");
// 	edge[2] = window.prompt("Enter w ");
// 	Edges.push(edge);
// }
var RobotPosition = [3,4];
// for(q=0;q<k;q++){
// 	RobotPosition[q] = window.prompt("Enter RobotPosition ");
// }

//RobotPosition.push(0); RobotPosition.push(3);RobotPosition.push(4);
RobotPosition = mergeSort(RobotPosition);
console.log(RobotPosition);
Divide(n,Edges,RobotPosition,k);
console.log("Mintime : " + minTime);