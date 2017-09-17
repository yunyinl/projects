
public class KVLinkedList {

	public KVNode head;
	public int length=0;
	public KVNode tail;
	public Object codewordString;
	public Object codeword;
	
	//add to list
	public void add(Object a, Object b) {
		if (head == null){
			head = new KVNode(a,b);
			tail = head;
		} else {
			tail.nextNode = new KVNode(a,b);
			tail = tail.nextNode;
		}
		length++;
	}
	
	//to test if a key is equal to another key
	public boolean keyEqual(Object k1, Object k2) throws Exception{
		if (k1 instanceof String){
			return ((String)k1).equals((String)k2);
		} else if (k1 instanceof Integer) {			
			return (int)k1==(int)k2;
		}
		System.out.println("k1 is neither string nor int, it is: "+k1.getClass()+"k1 is "+k1);
		throw new Exception("k1 is neither string nor int.");
	}
	
	@Override
	public String toString(){
		KVNode temp =head;
		String a = "";
		while (temp != null) {
			a=a+"k= "+temp.k+"v= "+temp.v+",";
			temp = temp.nextNode;
		}
		
		return a;
	}
	
	//given key, get the value
	public Object get(Object k) throws Exception {
		if (codeword !=null) {
			if (keyEqual(codeword, k)) { 
				if ((k instanceof Integer)&&((int)k == 314)) {
				}
				return codewordString;
			}
		}

		KVNode temp = head;		
		for (int i =0; i<length;i++) {	
			if (keyEqual(temp.k, k)){			
				return (Object)temp.v;
			}
			temp = temp.nextNode;
		}		
		return null;
			
	}
	
	//test if the list contains a key k
	public boolean containsKey(Object k) throws Exception{
		Object temp = get(k);
		if (temp != null) {
			codewordString = temp;
			codeword = k;
		}
		
		if (temp == null)
			return false;
		else
			return true;
	}
	
	
	
	public class KVNode{
		Object k;
		Object v;
		KVNode nextNode;
		
		public KVNode(Object k1, Object v1){
			k=k1;
			v=v1;
		}
		
	}


}
