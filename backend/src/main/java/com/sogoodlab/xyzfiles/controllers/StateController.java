package com.sogoodlab.xyzfiles.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sogoodlab.xyzfiles.dto.state.PanelDto;
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

    @Autowired
    private ObjectMapper mapper;

    @GetMapping
    public String state() throws IOException {
        return mapper.writeValueAsString(stateService.getState());
    }

    @PostMapping("/cwd/{name}/{pos}")// /state/update/cwd/{name}/{pos}
    public @ResponseBody String stateUpdate(@PathVariable("name") PanelDto.PanelDirection name, @PathVariable int pos, @RequestBody String path) throws IOException {
        return mapper.writeValueAsString(
                stateService.operationOnState(state -> {
            state.getPanels().get(name).getTabs().set(pos, path);
            state.getPanels().get(name).setCurrent(pos);
        }));
    }

    @PutMapping("/tab/{panelName}") // /state/update/tab/new/{panelName}
    public @ResponseBody String addTab(@PathVariable("panelName") PanelDto.PanelDirection panelName) throws IOException {
        stateService.operationOnState(state -> {
            var tabs = state.getPanels().get(panelName).getTabs();
            tabs.add(File.separator);
            state.getPanels().get(panelName).setCurrent(tabs.size()-1);
            log.info("Creating new tab on panel {}", panelName);
        });
        return "Ok";
    }

    @PostMapping("/panel/{panelName}/tab/current/{pos}") // /state/update/panel/{panelName}/tab/current/{pos}
    public @ResponseBody String changeCurrentTab(@PathVariable("panelName") PanelDto.PanelDirection panelName, @PathVariable("pos") int pos) throws IOException {
        stateService.operationOnState(state -> {
            state.getPanels().get(panelName).setCurrent(pos);
        });
        return "OK";
    }

    @DeleteMapping("/panel/{panelName}/tab/{pos}") // /state/update/panel/{panelName}/tab/remove/{pos}
    public @ResponseBody String removeTab(@PathVariable("panelName") PanelDto.PanelDirection panelName, @PathVariable("pos") int pos) throws IOException {
        stateService.operationOnState(state -> {
            var tabs = state.getPanels().get(panelName).getTabs();

            if(pos==0 && tabs.size()<2){
                throw new RuntimeException("Can't remove single tab");
            }

            tabs.remove(pos);

            if(state.getPanels().get(panelName).getCurrent() == pos){
                int newPos = pos==0? pos+1: pos-1;
                state.getPanels().get(panelName).setCurrent(newPos);
            }

            log.info("Removing tab from panel {} in position {}", panelName, pos);
        });
        return "OK";
    }

}
