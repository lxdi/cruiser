package com.sogoodlab.xyzfiles;

import com.sogoodlab.xyzfiles.controllers.MainController;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;


public class JSONObjectsTest {

    @Test
    public void accessTest(){
        String json = "{\"panels\":{\"left\":{\"cwd\":\"/home\"}}}";
        JSONObject jsonObject = new JSONObject(json);

        assertEquals("/home", jsonObject.getJSONObject("panels").getJSONObject("left").get("cwd"));
    }

    @Test
    public void parseArrayTest(){
        String json = "{\"panels\":[\"test1\", \"test2\"]}";
        JSONObject jsonObject = new JSONObject(json);

        assertEquals("test1", MainController.toList(jsonObject.getJSONArray("panels")).get(0));
        assertEquals("test2", MainController.toList(jsonObject.getJSONArray("panels")).get(1));
    }

}
