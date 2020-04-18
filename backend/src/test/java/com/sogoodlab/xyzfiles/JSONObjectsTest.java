package com.sogoodlab.xyzfiles;

import org.json.JSONObject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;


public class JSONObjectsTest {

    @Test
    public void test(){
        String json = "{\"panels\":{\"left\":{\"cwd\":\"/home\"}}}";
        JSONObject jsonObject = new JSONObject(json);

        assertEquals("/home", jsonObject.getJSONObject("panels").getJSONObject("left").get("cwd"));
    }

}
