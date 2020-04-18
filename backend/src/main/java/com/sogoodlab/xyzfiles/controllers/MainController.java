package com.sogoodlab.xyzfiles.controllers;

import com.sogoodlab.xyzfiles.data.FileDto;
import org.apache.commons.io.FileUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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

    @PostMapping("/get/files")
    public @ResponseBody List<FileDto> files(@RequestBody String path){
        final File folder = new File(path);
        return Arrays.stream(Optional.ofNullable(folder.listFiles()).orElse(new File[0]))
                .map(FileDto::of).collect(Collectors.toList());
    }

    @GetMapping("/get/state")
    public @ResponseBody String state() throws IOException {
        File stateJsonFile = new File(stateJsonPath);
        if(!stateJsonFile.exists()){
            log.warn(String.format("Didn't find a state file in %s; creating new from default", stateJsonFile));
            FileUtils.copyInputStreamToFile(this.getClass().getResourceAsStream(DEFAULT_STATE_PATH), stateJsonFile);
        }
        return new JSONObject(FileUtils.readFileToString(stateJsonFile, StandardCharsets.UTF_8)).toString();
    }

}
