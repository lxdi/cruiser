package com.sogoodlab.xyzfiles.util;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.List;

public class JsonUtil {

    public static List<String> toList(JSONArray jsonArray){
        List<String> result = new ArrayList<>(jsonArray.length());
        for(int i=0; i<jsonArray.length(); i++){
            result.add(jsonArray.getString(i));
        }
        return result;
    }

    public static String[] toArray(List<String> list){
        String[] result = new String[list.size()];
        for(int i=0; i<list.size(); i++){
            result[i] = list.get(i);
        }
        return result;
    }
}
