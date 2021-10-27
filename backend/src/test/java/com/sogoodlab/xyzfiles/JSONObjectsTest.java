package com.sogoodlab.xyzfiles;

import com.sogoodlab.xyzfiles.controllers.MainController;
import com.sogoodlab.xyzfiles.util.JsonUtil;
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

        assertEquals("test1", JsonUtil.toList(jsonObject.getJSONArray("panels")).get(0));
        assertEquals("test2", JsonUtil.toList(jsonObject.getJSONArray("panels")).get(1));
    }

}
