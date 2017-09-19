import numpy as np, pandas as pd 
import math 


def getData(s):
    return pd.read_csv(open(s, 'r'))

def isContinous(featureVal):
    return (isinstance(featureVal,np.integer) or isinstance(featureVal,np.float))


#destructively split training data into 4 quantiles(0,0.25,0.5,0.75,1) and then split test data accordingly 
def discretize(traindata,testdata,split=4):
    for colName in traindata.columns[:-1]:
        if traindata[colName].unique().size<10:
            continue
        if isContinous(traindata[colName].values[0]):
            ser1,trainbins=pd.qcut(traindata[colName],split,retbins=True)
            trainbins[0],trainbins[split]=0.0,5000.0
            traindata[colName]=pd.cut(traindata[colName],bins=trainbins,include_lowest=True)
            testdata[colName]=pd.cut(testdata[colName],bins=trainbins,include_lowest=True)
    return traindata,testdata

#shuffle the rows in the data table
def shuffleIt(data):
    shuffled = data.sample(frac=1).reset_index(drop=True)
    return shuffled
 
#It will split the data for cross validation   
#@param numFold is the number of folds the data will be splited into
#@param i tels which fold of numFold data is testData portion
def splitForCV(data,numFold=3,i=1):
    if i > numFold:
        raise Exception('Cannot select the',i,'th fold.')
    numRows = int(data.shape[0])
    oneFold = int(numRows/numFold)
    testData = data.iloc[(i-1)*oneFold:i*oneFold,:]
    trainData = pd.concat([data.iloc[:(i-1)*oneFold],data.iloc[i*oneFold:,:]],axis=0)
    trainData,testData=discretize(trainData,testData)
    return testData,trainData


def calcEntropy(data,labelheader):
    valueCounts = list(data[labelheader].value_counts())
    entropy = -sum(map(lambda x: x/sum(valueCounts)*math.log2(x/sum(valueCounts)),valueCounts))
    return entropy

# find out which is the majority data's label
def majorityFeature(data,labelheader):
    return data[labelheader].value_counts().idxmax()    

#after a feature is found, then split the data based on it                           
def splitData(data,splitFeature,value):
    subdata = data[data[splitFeature]==value]
    subdata=subdata.drop(splitFeature,axis=1)
    return subdata 

#find which feature to split based on entropy    
def findSplitFeature(data,labelheader):
    bestEntropy = None             
    #obtain a newEntropy for spliting by a feature
    for feature in data.columns[:-1]:
        newEntropy = 0
        for featureValue in data[feature].unique():
            subdata = splitData(data,feature,featureValue)
            prob = subdata.shape[0]/data.shape[0]
            newEntropy += calcEntropy(subdata,labelheader)*prob 
        if (bestEntropy == None) or (newEntropy<bestEntropy):
            bestEntropy = newEntropy
            bestFeature = feature           
    return bestFeature

#train the training data
def fit(data,maxdepth=3):
    return buildTree(data,data.columns[-1],0, maxdepth)

#it will recursively buid and return the dictionary, which is the decision tree.
#@param depth startes at 0, and will increase by 1 in each layer of recursion
def buildTree(data,labelheader, depth=0,maxdepth=3):  
    #print(depth,end="")
    if (depth == maxdepth):
        #print("maxdepth",maxdepth)
        return majorityFeature(data,labelheader)
    # if pure
    if data[labelheader].unique().size ==1:
        return data[labelheader].iloc[0]
    # if no feature to split
    if (data.shape[1] == 2):
        return majorityFeature(data,labelheader)   
    splitFeature = findSplitFeature(data,labelheader)
    treeDict = {splitFeature:{}}
    for featureValue in data[splitFeature].unique():
        subtree = buildTree(splitData(data,splitFeature,featureValue),labelheader,depth+1,maxdepth)
        treeDict[splitFeature][featureValue] = subtree
    return treeDict

#predict the correctness rate
#@return the correctness rate
#@param data is the full dataframe
#@param mydict is the trained tree represented by dictionary
def predictCorrectness(data,mydict): 
    correct, error = 0,0
    for i in range(len(data)): #run the fn for each row        
        item = predictClass(data.iloc[i:i+1,:],mydict)
        if (item == data.iloc[i].values[-1]):
            correct +=1
        else:
            error +=1
    return correct/(correct+error)

#predict the final classes 
#@return the list of predicted result(C1,C2,etc.)
#@param data is the full dataframe
#@param mydict is the trained tree represented by dictionary 
def predictClassBatch(data,mydict):
    result = []
    for i in range(len(data)): #run the fn for each row        
        item = predictClass(data.iloc[i:i+1,:],mydict)
        #print(item)
        result.append(item)
    return result

#will be called by predictClassBatch() because this function predict one row
#@param oneRow is one of the rows in the dataframe
def predictClass(oneRow,mydict): #data is ONE row df

    if not isinstance(mydict,dict): #?
        #print(mydict)
        return mydict
    getFeature = list(mydict.keys())[0]
    for v in mydict[getFeature]:
        if oneRow.iloc[0][getFeature] == v:
            return predictClass(oneRow,mydict[getFeature][v])

#This is the final function we use to get the list of predicted labels for testing data 
#based on training data, given the training and testing data name.        
def predicttask(traindatastring,testdatastring):
    traindata=getData(traindatastring)
    testdata=getData(testdatastring)
    traindata,testdata=discretize(traindata,testdata)
    fitted = fit(traindata,3)
    return predictClassBatch(testdata,fitted)
 
        
#this computes the correctness ratio using 10 fold validation
#@param maxdepth will be passed into the fit() function to train the model.
def finalbuild(data,folds=10,maxdepth=3):
    data=shuffleIt(data)
    correctness = []
    for n in range(1,folds+1): 
        testD,trainD=splitForCV(data,folds,n)
        theTree=fit(trainD,maxdepth)
        #if n == 1:
        correctness.append(predictCorrectness(testD,theTree))
    return(sum(correctness)/len(correctness))  

#this will perform the 10-fold cross-validation 30 times to find out best maxdepth
#to use. Unlike weka, here the data is randomized in each cross-validation, so performing
#it 30 times means we train and test the model 30*10times in total.
def findbestParam(data,folds,maxdepth):
    avr = []
    for i in range(30):
        avr.append(finalbuild(data,folds,maxdepth)) 
    return(sum(avr)/30)

#This is the final function we use to get the list of predicted labels for testing data 
#based on training data, given the training and testing data name.        
def predicttask(traindatastringtestdatastring):
    #print(traindatastringtestdatastring)
    files = traindatastringtestdatastring[1].split(',')
    traindatastring,testdatastring=files[0],files[1]
    #print(traindatastring,testdatastring)
    traindata=getData(traindatastring)
    testdata=getData(testdatastring)
    traindata,testdata=discretize(traindata,testdata)
    fitted = fit(traindata,3)
    return predictClassBatch(testdata,fitted)