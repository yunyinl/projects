public class IntLinkedList {

	public IntNode head;
	public int length=0;
	public IntNode tail;
	
	public class IntNode{
		int a;
		IntNode nextNode;
		
		public IntNode(int a){
			this.a=a;
		}
		
	}
	
	public int remove() {
	//Retrieves and removes the head (first element) of this list.
		int first = head.a;
		head=head.nextNode;
		length--;
		return first;
	}
	public int size(){
		return length;
	}
	
	//add an int to list
	public void add(int a){
		if (head == null){
			head = new IntNode(a);
			tail = head;
		} else {
			tail.nextNode = new IntNode(a);
			tail = tail.nextNode;
		}
		length++;
	}
	
}
