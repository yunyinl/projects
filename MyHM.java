
public class MyHM {

	KVLinkedList[] table=new KVLinkedList[57];
	public MyHM(){
	
	}
	
	//calculated the hashcode, itcan be negative, so call it combine with Math.abs()
	public int myhashcode(Object k) throws Exception{
		if (k instanceof Integer) {			
			return (int)k%57;			
		} else {
			
			if (!(k instanceof String)) {
				System.out.println("k1 is neither string nor int, it is: "+k.getClass()+"k is: "+k+".");
				throw new Exception("k is neither not Integer nor String, check why this error occurs");
			}			
			
			String s = (String)k;
			int len = s.length();
			char c;
			int h=0;
			for (int i = 0; i<len; i++) {
				c = s.charAt(i);
				h= 31*h + (int)c;
			}
			
			return h%57;
		}
	}

	//put the k-v pair
	public void put(Object k,Object v) throws Exception {
		int hashcode = Math.abs(myhashcode(k));
		if (table[hashcode]==null){
			table[hashcode] = new KVLinkedList();
		}
		table[hashcode].add(k, v);
	}
	
	//given key, return the value
	public Object get(Object k) throws Exception {

		int hashcode = Math.abs(myhashcode(k));
		return table[hashcode].get(k);
	}

	//test if contains a key k
	public boolean containsKey(Object k) throws Exception {
//		System.out.println("**k:"+k);
		int hashcode = Math.abs(myhashcode(k));
		if (table[hashcode] == null) 
			return false;
		else
			return table[hashcode].containsKey(k);
	}
	
}
