
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.EOFException;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/*
 *It works for binary and ASCII.
 *words.html is compressed from 2493531 bytes to 1070307 bytes. It's compressed to 42.9% of original size.
 *CrimeLatLonXY.csv is compressed from 2608940 bytes to 1283751 bytes. It's compressed to 49.2% of orignial size.
 *01_Overview.mp4 is compressed from 25008838 bytes to 33773775 bytes. It's compressed to 135% of original size.
 */
public class LZWCompression {
	//buffers for compression
	public static byte[] bufferByte = new byte[3];
	public static int[] bufferInt = new int[2];
	public static boolean needPadding = false;
	
	//buffers for decompression
	public static byte[] bufferByteDe = new byte[3];
	public static int[] bufferIntDe = new int[2];
	public static boolean hasPaddingDe = false;
	
	//write out the bits
	private static void writeBytes(Object codeword, int count, DataOutputStream out) throws Exception {
		//ret.add(codeword);
		bufferInt[count%2]=(int)codeword;
		needPadding = !needPadding;  
		if (count%2 == 1) { 
			bufferByte[0]= (byte)((bufferInt[0]>>4) & 0xff);
			bufferByte[1]= (byte)((((bufferInt[0]) & 0xf)<<4)+((bufferInt[1]>>8) & 0xf));
			bufferByte[2]= (byte)((bufferInt[1]) & 0xff);
			
			out.write(bufferByte);

		}
	}
	
	//add the 4 padding bits
	public static void addPadding(DataOutputStream out)throws IOException{
		bufferByte[0]= (byte)((bufferInt[0]>>4) & 0xff);
		out.writeByte(bufferByte[0]);
		bufferByte[1]= (byte)((((bufferInt[0]) & 0xf)<<4)+(0xf));
		out.writeByte(bufferByte[1]);
	}
	
	public static void compressLZW(String inputfile, String outputfile) throws Exception{
		DataInputStream in = new DataInputStream(new BufferedInputStream(new FileInputStream(inputfile)));
		DataOutputStream out = new DataOutputStream(new BufferedOutputStream(new FileOutputStream(outputfile)));
		
		
		//start to convert input file bytes to individual chars which in the end will form a string.
		byte byteIn;
		StringBuilder stringIn= new StringBuilder();
		int len = 0; //count how many characters we read from input file.
		
				
		try{
			while(true){
				byteIn = in.readByte();
				char currentByte = (char) byteIn; //currentByte is the byte read in as a character
				currentByte = (char)(currentByte & 0xFF);
				stringIn.append(currentByte);
				len ++;
			}
		} catch(EOFException e) {
			in.close();
		}  //until here, read in bytes from input file and form a string.
		
		String s = "";
		//start compress  
		int j = 0; //count how many characters we add to codeword table(hmap)
		MyHM hmap = new MyHM();
		for (int i =0; i<256; i++){
			hmap.put(String.valueOf((char)i), i);			
		} //until here, initialize a table with 256 chars
		s=String.valueOf(stringIn.charAt(0));
		char c;
		boolean iftablehasKey;
		for (int i = 1;i<len;i++) { 
			c = stringIn.charAt(i); // c is the read ahead character
			iftablehasKey = hmap.containsKey(s+c);
			if (iftablehasKey){  //if s+c is in the table
				s+=c; 
			} else {
				writeBytes(hmap.get(s),j,out); //output codeword(s)
				hmap.put(s+c,  256+j); //enter s+c into table
				s=String.valueOf(c); //s=c
				j++;
				if ((256+j) == 4096) { //4096 //12bit的int最大4095
					hmap = new MyHM();
					for (int m =0; m<256; m++){
						hmap.put(String.valueOf((char)m), m);			
					}
					j=0; 
				}
			}
		} // end for
		
		if (!s.equals("")) {
			writeBytes(hmap.get(s),j,out);
		}
			
		if (needPadding){
			addPadding(out);
		}
		try {
			out.close();
		} catch (java.io.IOException e) {
		}
	}
	
	private static void decompressLZW(String inputfile, String outputfile) throws Exception {
		DataInputStream in = new DataInputStream(new BufferedInputStream(new FileInputStream(inputfile)));
		DataOutputStream out = new DataOutputStream(new BufferedOutputStream(new FileOutputStream(outputfile)));
		
		//start to convert input file to a linkedlist of integers.
		IntLinkedList intll = new IntLinkedList(); 
		int a=0; //a is the int we will add to intll;		
		
		
		try{
			while(true){
				bufferByteDe[0] = in.readByte();
				bufferByteDe[1] = in.readByte();
				
				a= bufferByteDe[0];
				a = ((a & 0xff)<<4)+ ((bufferByteDe[1]>>4) & 0xf);
				a = a & 0xfff;
				intll.add(a);
				bufferByteDe[2] = in.readByte(); 
				
				a =  bufferByteDe[1];
				int temp = bufferByteDe[2]; 
				temp = temp & 0xff;
				a=((( a & 0xf)<<8)+ temp);
				a = a & 0xfff;
				intll.add(a);	
			}
		} catch(EOFException e) {
			in.close();			
		} //until here we have a linkedlist of integers from input file.
		
		String[] decoTable = new String[4096]; //use simple array instead of hmap
		for (int i =0; i<256; i++){
			decoTable[i]=String.valueOf((char)i);
		} //until here, initialize a table with 256 chars(string format)
		
		//read priorcodeword and output its corresponding character
		StringBuilder outputString= new StringBuilder();
		int intllsize = intll.size();
		
		int priorcodeword = intll.remove();
		String priorcodewordString = decoTable[priorcodeword];
				
		outputString.append(priorcodewordString);
		int codeword;
		String codewordString="";
		
		String toadd="";
		int j=0;
		
		
		for (int i =1; i< intllsize;i++){
			codeword = intll.remove();
			if (decoTable[codeword]==null){	//if table doesn't contain the codeword			
				priorcodewordString = decoTable[priorcodeword];	
				toadd = priorcodewordString;
				//System.out.println(priorcodewordString==null);
				toadd += priorcodewordString.charAt(0);
				decoTable[256+j]=toadd;
				outputString.append(toadd);
			} else {
				//enter string(priorcodeword)+firstChar(string(codeword)) into hmap
				codewordString = decoTable[codeword];
				priorcodewordString = decoTable[priorcodeword];
				//printControl("(does contain)codewordString: "+codewordString+"codeword: "+codeword);
				toadd = priorcodewordString + codewordString.charAt(0);
				//printControl("toadd: "+toadd+"j: "+j);
				decoTable[256+j]=toadd;
				//output string(codeword);
				outputString.append(codewordString);
			}
			priorcodeword = codeword;
			j++;
			
			if ((256+j) == 4096) { 
				decoTable = new String[4096];
				//initialize a table with 256 chars
				for (int m =0; m<256; m++){
					decoTable[m]= String.valueOf((char)m);			
				} 
			j=0;
			}
		}
		
		out.writeBytes(outputString.toString());
		out.close();
		// write outputString to outputfile
	}

	public static void main(String args[]) throws Exception{
		
		String action = args[0];
		String inputfile = args[1];
		String outputfile = args[2];

		if (action.equals("c")) {
			compressLZW(inputfile,outputfile);
		}	

		if (action.equals("d")) {
			decompressLZW(inputfile,outputfile);
		}

	}

		
}

