package com.sogoodlab.xyzfiles.controllers;

import com.sogoodlab.xyzfiles.data.FileDto;
import org.apache.commons.io.FileUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
public class MainController {

    Logger log = LoggerFactory.getLogger(MainController.class);

    public static String DEFAULT_STATE_PATH = "/default/state.json";

    @Value("${state.json.path}")
    String stateJsonPath;

    @PostMapping("/file/get/all")
    public @ResponseBody List<FileDto> files(@RequestBody String path){
        final File folder = new File(path);
        return Arrays.stream(Optional.ofNullable(folder.listFiles()).orElse(new File[0]))
                .map(FileDto::of).collect(Collectors.toList());
    }

    @GetMapping("/state/get")
    public @ResponseBody String state() throws IOException {
        return new JSONObject(FileUtils.readFileToString(getStateFile(), StandardCharsets.UTF_8)).toString();
    }

    @PostMapping("/state/update/cwd/{name}")
    public @ResponseBody String stateUpdate(@PathVariable("name") String name, @RequestBody String path) throws IOException {
        File stateFile = getStateFile();
        JSONObject stateJson = new JSONObject(FileUtils.readFileToString(stateFile, StandardCharsets.UTF_8));
        stateJson.getJSONObject("panels").getJSONObject(name).put("cwd", path);
        try(InputStream is = new ByteArrayInputStream(stateJson.toString().getBytes())){
            FileUtils.copyInputStreamToFile(is, stateFile);
        }
        return stateJson.toString();
    }

    private File getStateFile() throws IOException {
        File stateJsonFile = new File(stateJsonPath);
        if(!stateJsonFile.exists()){
            log.warn(String.format("Didn't find a state file in %s; creating new from default", stateJsonFile));
            try(InputStream is = this.getClass().getResourceAsStream(DEFAULT_STATE_PATH)){
                FileUtils.copyInputStreamToFile(is, stateJsonFile);
            }
        }
        return stateJsonFile;
    }

}
