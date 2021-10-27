package com.sogoodlab.xyzfiles.controllers;

import com.sogoodlab.xyzfiles.service.CommandsService;
import com.sogoodlab.xyzfiles.service.StateService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping(path="/state")
public class StateController {

    Logger log = LoggerFactory.getLogger(StateController.class);

    @Autowired
    private StateService stateService;

    @Autowired
    private CommandsService commandsServices;

    @GetMapping
    public String state() throws IOException {
        return stateService.getState().toString();
    }

    @PostMapping("/cwd/{name}/{pos}")// /state/update/cwd/{name}/{pos}
    public @ResponseBody String stateUpdate(@PathVariable("name") String name, @PathVariable int pos, @RequestBody String path) throws IOException {
        return stateService.operationOnState(stateJson -> {
            stateJson.getJSONObject("panels").getJSONObject(name).getJSONArray("tabs").put(pos, path);
            stateJson.getJSONObject("panels").getJSONObject(name).put("current", pos);
        }).toString();
    }

    @PutMapping("/tab/{panelName}") // /state/update/tab/new/{panelName}
    public @ResponseBody String addTab(@PathVariable("panelName") String panelName) throws IOException {
        stateService.operationOnState(stateJson -> {
            JSONArray tabsArray = stateJson.getJSONObject("panels").getJSONObject(panelName).getJSONArray("tabs");
            tabsArray.put(File.separator);
            stateJson.getJSONObject("panels").getJSONObject(panelName).put("current", tabsArray.length()-1);
            log.info("Creating new tab on panel {}", panelName);
        });
        return "Ok";
    }

    @PostMapping("/panel/{panelName}/tab/current/{pos}") // /state/update/panel/{panelName}/tab/current/{pos}
    public @ResponseBody String changeCurrentTab(@PathVariable("panelName") String panelName, @PathVariable("pos") int pos) throws IOException {
        stateService.operationOnState(stateJson -> {
            stateJson.getJSONObject("panels").getJSONObject(panelName).put("current", pos);
        });
        return "OK";
    }

    @DeleteMapping("/panel/{panelName}/tab/{pos}") // /state/update/panel/{panelName}/tab/remove/{pos}
    public @ResponseBody String removeTab(@PathVariable("panelName") String panelName, @PathVariable("pos") int pos) throws IOException {
        stateService.operationOnState(stateJson -> {
            JSONObject panel = stateJson.getJSONObject("panels").getJSONObject(panelName);
            JSONArray tabs = panel.getJSONArray("tabs");
            if(pos==0 && tabs.length()<2){
                throw new RuntimeException("Can't remove single tab");
            }
            tabs.remove(pos);
            if(panel.getInt("current")==pos){
                int newPos = pos==0? pos+1: pos-1;
                panel.put("current", newPos);
            }
            log.info("Removing tab from panel {} in position {}", panelName, pos);
        });
        return "OK";
    }

}
