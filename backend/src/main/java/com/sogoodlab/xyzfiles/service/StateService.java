package com.sogoodlab.xyzfiles.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sogoodlab.xyzfiles.dto.state.StateDto;
import org.apache.commons.io.FileUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;

@Service
public class StateService {

    private Logger log = LoggerFactory.getLogger(StateService.class);

    public static String DEFAULT_STATE_PATH = "/default/state.json";
    public static String DEFAULT_STATE_PATH_MAC = "/default/state.mac.json";
    public static String DEFAULT_STATE_PATH_WIN = "/default/state.win.json";

    @Value("${state.json.path}")
    private String stateJsonPath;

    @Autowired
    private ObjectMapper mapper;

    public StateDto getState() {
        try {
            String stateRaw = FileUtils.readFileToString(getStateFile(), StandardCharsets.UTF_8);
            return mapper.readValue(stateRaw, StateDto.class);
        }catch (IOException e){
            throw new RuntimeException("Error while reading state json file: ", e);
        }
    }

    public StateDto operationOnState(Consumer<StateDto> operation) throws IOException {

        StateDto state = getState();
        operation.accept(state);

        try(InputStream is = new ByteArrayInputStream(mapper.writeValueAsString(state).getBytes())){
            FileUtils.copyInputStreamToFile(is, getStateFile());
        }
        return state;
    }

    private File getStateFile() {
        File stateJsonFile = new File(stateJsonPath);

        if(stateJsonFile.exists()){
           return stateJsonFile;
        }

        log.warn(String.format("Didn't find a state file in %s; creating new from default", stateJsonFile));

        try (InputStream is = getDefaultStateFileIS()) {
            FileUtils.copyInputStreamToFile(is, stateJsonFile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return stateJsonFile;
    }

    private InputStream getDefaultStateFileIS(){
        log.info("OS {}", System.getProperty("os.name"));

        if(System.getProperty("os.name").toLowerCase().contains("windows")){
            return this.getClass().getResourceAsStream(DEFAULT_STATE_PATH_WIN);
        }

        if(System.getProperty("os.name").toLowerCase().contains("mac")){
            return this.getClass().getResourceAsStream(DEFAULT_STATE_PATH_MAC);
        }

        return this.getClass().getResourceAsStream(DEFAULT_STATE_PATH);
    }

}
