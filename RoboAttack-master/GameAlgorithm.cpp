#include <iostream>

using namespace std;

int no_of_edges;
int minTime = 0;
struct SET
{	
	int data;
	int rank;
	int weight;
	SET *parent;
	SET *p;
};

/* function to make every vertex into a set*/

SET* MAKE_SET(int v)  // function to make every vertex into a set
{
	SET *ptr=new SET;
	ptr->data=v;   /* stores the vertex id number */
	ptr->rank=0;	/* a flag which tells whether the vertex contains robot or not
				   	 * if it contains robot then flag > 0 else flag = 0*/
	ptr->weight=0;   /* stores the weight of the edge b/w the vertex and the parent vertex*/
	ptr->parent=ptr;  /* parent is the vertex to which the present vertex is connected
					   * that is there is an edge b/w present vertex and the parent */
	ptr->p=ptr;   /* p is the representative element of the set */
	return ptr;
}

void merge(int arr[], int l, int m, int r)
{
    int i, j, k;
    int n1 = m - l + 1;
    int n2 =  r - m;
 
    /* create temp arrays */
    int L[n1], R[n2];
 
    /* Copy data to temp arrays L[] and R[] */
    for (i = 0; i < n1; i++)
        L[i] = arr[l + i];
    for (j = 0; j < n2; j++)
        R[j] = arr[m + 1+ j];
 
    /* Merge the temp arrays back into arr[l..r]*/
    i = 0; // Initial index of first subarray
    j = 0; // Initial index of second subarray
    k = l; // Initial index of merged subarray
    while (i < n1 && j < n2)
    {
        if (L[i] <= R[j])
        {
            arr[k] = L[i];
            i++;
        }
        else
        {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
 
    /* Copy the remaining elements of L[], if there
       are any */
    while (i < n1)
    {
        arr[k] = L[i];
        i++;
        k++;
    }
 
    /* Copy the remaining elements of R[], if there
       are any */
    while (j < n2)
    {
        arr[k] = R[j];
        j++;
        k++;
    }
}
 
/* l is for left index and r is right index of the
   sub-array of arr to be sorted */
void mergeSort(int arr[], int l, int r)
{
    if (l < r)
    {
        // Same as (l+r)/2, but avoids overflow for
        // large l and h
        int m = l+(r-l)/2;
 
        // Sort first and second halves
        mergeSort(arr, l, m);
        mergeSort(arr, m+1, r);
 
        merge(arr, l, m, r);
    }
}

// A recursive binary search function. It returns location of x in
// given array arr[l..r] is present, otherwise -1
int binarySearch(int arr[], int l, int r, int x)
{
   if (r >= l)
   {
        int mid = l + (r - l)/2;

        // If the element is present at the middle itself
        if (arr[mid] == x)  return mid;

        // If element is smaller than mid, then it can only be present
        // in left subarray
        if (arr[mid] > x) return binarySearch(arr, l, mid-1, x);

        // Else the element can only be present in right subarray
        return binarySearch(arr, mid+1, r, x);
   }

   // We reach here when element is not present in array
   return -1;
}


int FIND_SET(int vertex, SET *Sets[])  // to find the representative element of the set
{
	SET *ptr=Sets[vertex];
	while(ptr->p!=ptr)
		ptr=ptr->p;
	return ptr->data;

}
/* function to join two sets. It joins the second set(v) to the end of the first set(u)
 * @u,@v is the edge which is to be joined and an edge from the set containing
 * v is to be deleted. @p is the representative element of the first set to which
 * the part of second set is to be joined */

void UNITE(SET *Sets[], int u, int v, int w, int p) {
	int weight, weight1 = w;
	SET *ptr1 = Sets[u];
	SET *ptr = Sets[v];
	SET *temp;
	/* loop which attaches each element of the second set to the 
	 * first set untill we get broken edge which has its weight set to 0
	 * and it parent point to itself */
	while(ptr != ptr1)
	{
		temp = ptr->parent;
		weight = weight1;
		weight1	= ptr->weight;
		ptr->parent = ptr1;
		ptr->p=Sets[p];
		ptr->weight = weight;
		ptr1 = ptr;
		ptr = temp;
	}
}

/* function to check whether the given point(@v) contains robot or not
 * @RobotPosition is an array storing the positions of the robots and k is its size
 * Function returns 1 if robot is present otherwise returns 0
 */

bool CHECKROBOT(int v, int RobotPosition[], int k, SET *Sets[]) {
	if(Sets[v]->rank>0)
		return 1;
	else {
			if(binarySearch(RobotPosition,0,k-1,v)!=-1)
			{	Sets[v]->rank+=1;
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

int FIND_MIN(int u, int v, int w, SET *Sets[], int p1, int p2) {
	int min = w, data;
	SET *ptr1, *ptr2;
	ptr1 = Sets[u];
	ptr2 = Sets[v];
	int j=0; /* flag to check whether the min weight edge is on the
				* set(containing u) or the set(containing v).
				* if j>0 then it is on Sets[v]*/
	/* loop to find the minimum weight edge in set(containing u) */
	while(ptr1->parent != ptr1)
	{
		if(ptr1->weight<min) {
			min = ptr1->weight;
			data = ptr1->data;
		}
		ptr1 = ptr1->parent;
	}
	/* loop to find the edge which has the weight less than w or any edge
	 * in the set(containing u). */
	while(ptr2->parent != ptr2)
	{
		if(ptr2->weight<min) {
			min = ptr2->weight;
			data = ptr2->data;
			j++; // flag to check whether the min weight is on the Sets[u] or on Sets[v]
				// if j>0 then it is on Sets[v]
		}
		ptr2 = ptr2->parent;
	}
	/* if minimum weight edge has weight w, then return w and donot join edge
	 * u,v. */
	if(min == w) {
		return w;
	}
	/* if minimum weight edge has weight less than w, then delete the edge*/
	else {
		Sets[data]->parent = Sets[data];
		Sets[data]->weight = 0;
		/* if j>0 which means the set(containing v) has the minimum weight edge
		 * so join the set(containing v) to the set(containing v) otherwise do vise-versa*/
		if(j>0)	
			UNITE(Sets,u,v,w,p1);
		else
			UNITE(Sets,v,u,w,p2);
	}
	return min;
}


/* function to join the edge @u,@v which has the weight @w by checking whether
 * set(containing u) and set(containing v) has robots or not. If both the sets
 * contain robots, then delete the minimum weight edge by calling the FindMin 
 * function else join the two vertex @u, @v by calling Unite function */

void UNION(int u, int v, SET *Sets[], int w, int RobotPosition[], int k) {
	/* finding the representative elements */
	int p1 = FIND_SET(u,Sets);
	int p2 = FIND_SET(v,Sets);
	/* checking for Robots */
	bool c1 = CHECKROBOT(p1,RobotPosition,k,Sets);
	bool c2 = CHECKROBOT(p2,RobotPosition,k,Sets); 
	if(c1 && c2) {
		/* if both contain robots, then delete path */
		minTime += FIND_MIN(u,v,w,Sets,p1,p2);
	}
	else if(c1) {
		/* if one of them contains robot then add the set which doesnot contain
		 * robot to the set which contains robot. This way we will always be keeping
		 * the vertex which contains robot at the top of the set. */
		UNITE(Sets,u,v,w,p1);
	}
		 else {
		 	/* else join the sets in any order */
			UNITE(Sets,v,u,w,p2);
		 }
}

/* function to check all the edges and join those which donot form a path b/w any two
 * robots through union function. It is the main function which needs to be called to 
 * delete the paths and find the minimum time. All other functions are called through it.
 * @n is the no of vertices which is required to make set for each vertex initially.
 * @Edges is array of all the edges of the graph through which the function will iterate.
 * @RobotPosition is an array storing the position vertex of the robots.
 * @k is the no of robots.*/

void DIVIDE(int n, int EDGES[][3], int RobotPosition[], int k) {
	SET *Sets[n];
	for(int i=0;i<n;i++)
		Sets[i] = MAKE_SET(i);
	int u, v, w;   // u, v is an edge of the graph
	for(int i=0;i<no_of_edges;i++)
	{
		u = EDGES[i][0];
		v = EDGES[i][1];
		w = EDGES[i][2];
		UNION(u,v,Sets,w,RobotPosition,k);
	}	
}

int main() {
	int n, k;    // n is the no of vertices and k is the no of robots
	cin>>n>>k>>no_of_edges;
	int v1, v2, w;   // (v1,v2) is an edge of the graph and w is the weight of the edge
	int EDGES[no_of_edges][3];  // 2-D array which stores the edges of the graph
	for(int i=0;i<no_of_edges;i++) {
		cin>>v1>>v2>>w;  // inserting edges into a 2-D array along with weights to store the graph
		EDGES[i][0] = v1;
		EDGES[i][1] = v2;
		EDGES[i][2] = w;
	}
	int RobotPosition[k];
	for(int i=0;i<k;i++)
		cin>>RobotPosition[i];
	mergeSort(RobotPosition,0,k-1);
	DIVIDE(n,EDGES,RobotPosition,k);
	for(int i=0;i<k;i++)
		cout<<RobotPosition[i]<<" ";
	cout<<endl;
	cout<<minTime;
	return 0;
}
