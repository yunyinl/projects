
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


#base function
def searchContinuityBase(is_range, data, indexBegin, indexEnd, thresholds, winLength):
    count = 0
    is_first_index = True
    if is_range:
        ret = []

    #condition for range choice
    start_index = indexBegin   
    if indexBegin < indexEnd:
        end_index = indexEnd+1
        step = 1
    else:
        end_index = indexEnd-1
        step = -1


    #main logic
    for i in range(start_index,end_index, step):
        
        #condition for criteria choice
        if len(data) == 1:
            data1 = data[0]
            if len(thresholds) == 1:
                criteria = (data1[i] > thresholds[0])
            else:
                criteria = (data1[i] > thresholds[0]) and (data1[i] < thresholds[1])
        else:
            data1 = data[0]
            data2 = data[1]
            criteria = (data1[i] > thresholds[0]) and (data2[i] > threshold[1])

        #based on condition
        if criteria:
            count += 1
            if (is_first_index):
                first_index = i
                is_first_index = False
            else:
                if is_range:
                    last_index = i                
        else:
            count = 0
            is_first_index = True
        if not is_range: 
            if count == winLength:
                return [first_index]
        else:
            if count >= winLength:
                ret.append((last_index - winLength + 1, last_index))
    if not is_range: 
        return None 
    else:
        return ret


def searchContinuityAboveValue(data, indexBegin, indexEnd, threshold, winLength):
    return searchContinuityBase(False, [data], indexBegin, indexEnd, [threshold], winLength)

def backSearchContinuityWithinRange(data, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength):
    return searchContinuityBase(False, [data], indexBegin, indexEnd, [thresholdLo, thresholdHi], winLength)

def searchContinuityAboveValueTwoSignals(data1, data2, indexBegin, indexEnd, threshold1, threshold2, winLength):
    return searchContinuityBase(False, [data1, data2], indexBegin, indexEnd, [threshold1, threshold2], winLength)
                                                                           
def searchMultiContinuityWithinRange(data, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength):
    return searchContinuityBase(True, [data], indexBegin, indexEnd, [thresholdLo, thresholdHi], winLength)

