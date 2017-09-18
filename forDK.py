
# Q&A:
# Q: data structure:  
# A: each column save as ArrayList (use pandas and numpy to convert to python list)
# Q: at what index do you think impact happens in this data file? 
# A: around 870~880. More precisely 875 or 878 based on plotting result





import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline

df = pd.read_csv("latestSwing.csv",header=None)
df.head(5)
(df[0].values).tolist() #convert column to numpy array then to python list
df_for_graph = df.iloc[:,1:7] 
df_for_graph.plot() #plot whole data except for the timestamp column

df_for_graph1 = df.iloc[870:885,1:7] 
df_for_graph1.plot() # narrow the range and plot again


def searchContinuityAboveValue(data, indexBegin, indexEnd, threshold, winLength):
    count = 0
    flag = True
    # for i in range(indexBegin, indexEnd-winLength+2):
    for i in range(indexBegin, indexEnd +1):
        if data[i] > threshold:
            count += 1
            if (flag):
                first_index = i
                flag = False
        else:
            count = 0
            flag = True
        if count == winLength:
            return first_index
    return None        


def backSearchContinuityWithinRange(data, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength):
    count = 0
    flag = True
    for i in range(indexBegin,indexEnd-1, -1):
        #print(i, (data[i] > thresholdLo) and (data[i] < thresholdHi))
        if (data[i] > thresholdLo) and (data[i] < thresholdHi) :
            count += 1
            if (flag):
                first_index = i
                flag = False
        else:
            count = 0
            flag = True
        if count == winLength:
            return first_index
    return None      


 def searchContinuityAboveValueTwoSignals(data1, data2, indexBegin, indexEnd, threshold1, threshold2, winLength):
    count = 0
    flag = True
    for i in range(indexBegin,indexEnd+1):
        if (data1[i] > threshold1) and (data2[i] > threshold2) :
            count += 1
            if (flag):
                first_index = i
                flag = False
        else:
            count = 0
            flag = True
        if count == winLength:
            return first_index
    return None      


def searchMultiContinuityWithinRange(data, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength):
    count = 0
    flag = True
    ret = []
    # for i in range(indexBegin, indexEnd-winLength+2):
    for i in range(indexBegin, indexEnd +1):
        if (data[i] > thresholdLo) and (data[i] < thresholdHi) :
            count += 1
            if (flag):
                first_index = i
                flag = False
            else:
                last_index = i
        else:
            count = 0
            flag = True
        if count >= winLength:
            ret.append((last_index - winLength + 1, last_index))
    return ret    