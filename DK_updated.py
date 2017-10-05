#base function
def searchContinuityBase(is_range, data1, data2, indexBegin, indexEnd, threshold1, threshold2, winLength):
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
        if data2 is None:
            if threshold2 is None:
                criteria = (data1[i] > threshold1)
            else:
                criteria = (data1[i] > threshold1) and (data1[i] < threshold2)
        else:
            criteria = (data1[i] > threshold1) and (data2[i] > threshold2)

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
                return first_index
        else:
            if count >= winLength:
                ret.append((last_index - winLength + 1, last_index))
    if not is_range: 
        return None 
    else:
        return ret


def searchContinuityAboveValue(data, indexBegin, indexEnd, threshold, winLength):
    return searchContinuityBase(False, data, None, indexBegin, indexEnd, threshold, None, winLength)

def backSearchContinuityWithinRange(data, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength):
    return searchContinuityBase(False, data, None, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength)

def searchContinuityAboveValueTwoSignals(data1, data2, indexBegin, indexEnd, threshold1, threshold2, winLength):
    return searchContinuityBase(False, data1, data2, indexBegin, indexEnd, threshold1, threshold2, winLength)

def searchMultiContinuityWithinRange(data, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength):
    return searchContinuityBase(True, data, None, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength)

