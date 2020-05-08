package com.sogoodlab.xyzfiles.controllers;

import com.sogoodlab.xyzfiles.data.FileDto;
import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class MainController {

    Logger log = LoggerFactory.getLogger(MainController.class);

    public static String DEFAULT_STATE_PATH = "/default/state.json";
    public static String DEFAULT_STATE_PATH_WIN = "/default/state.win.json";

    @Value("${state.json.path}")
    private String stateJsonPath;

    @Value("${trash.bucket.bookmark}")
    private String trashBookmark;

    @PostMapping("/file/get/all")
    public @ResponseBody List<FileDto> files(@RequestBody String path){
        final File folder = new File(path);
        return Arrays.stream(Optional.ofNullable(folder.listFiles()).orElse(new File[0]))
                .map(FileDto::of).collect(Collectors.toList());
    }

    @GetMapping("/state/get")
    public @ResponseBody String state() throws IOException {
        return getStateJson().toString();
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

    @PostMapping("/command/open")
    public @ResponseBody String open(@RequestBody String path) throws IOException {
        log.info("Opening: " + path);
        Runtime rt = Runtime.getRuntime();
        Process pr = rt.exec(toArray(getCommand(path)));
        return "Seccess";
    }

    @PostMapping("/command/trash/move")
    public @ResponseBody String delete(@RequestBody FileDto file) throws IOException {
        moveToTrash(file.getPath());
        return "Ok";
    }

    @PostMapping("/command/trash/move/multiple")
    public @ResponseBody String multiDelete(@RequestBody List<FileDto> files){
        for(FileDto file : files){
            try{
                moveToTrash(file.getPath());
            } catch (IOException e){
                log.error(e.getMessage(), e);
            }
        }
        return "Ok";
    }

    @PostMapping("/command/trash/clean")
    public @ResponseBody String cleanTrash() throws IOException {
        FileUtils.cleanDirectory(new File(getTrashPath()));
        return "Ok";
    }

    @PostMapping("/command/copy")
    public @ResponseBody String copy(@RequestBody Map<String, Object> requisites) throws IOException {
        List<String> pathsSource = (List<String>) requisites.get("from");
        String targetPath = (String) requisites.get("to");
        pathsSource.forEach(path -> copyMove(path, targetPath, "copy"));
        return "OK";
    }

    @PostMapping("/command/move")
    public @ResponseBody String move(@RequestBody Map<String, Object> requisites) throws IOException {
        List<String> pathsSource = (List<String>) requisites.get("from");
        String targetPath = (String) requisites.get("to");
        pathsSource.forEach(path -> copyMove(path, targetPath, "move"));
        return "OK";
    }

    @PostMapping("/command/rename")
    public @ResponseBody String rename(@RequestBody Map<String, String> requisites) throws IOException {
        File file = new File(requisites.get("path"));
        String newName = requisites.get("newName");
        String newPath = file.getParent()+File.separator+newName;
        log.info("Rename {} to {}", file.getAbsoluteFile(), newPath);
        Files.move(file.toPath(), Paths.get(newPath));
        return "OK";
    }

    @PostMapping("/command/create/dir")
    public @ResponseBody String createDir(@RequestBody String path){
        File dir = new File(path);
        if(!dir.exists()){
            log.info("Creating new directory {}", path);
            dir.mkdir();
        } else {
            log.error("Directory already exists {}", path);
        }
        return "Ok";
    }

    private void copyMove(String source, String target, String operationType){
        File sourceFile = new File(source);
        try {
            if(target == null){
                throw new NullPointerException("Target is null");
            }
            switch (operationType) {
                case "copy":
                    log.info("Copy {} to {}", source, target);
                    if(sourceFile.isDirectory()){
                        FileUtils.copyDirectory(sourceFile, new File(target+sourceFile.getName()));
                    } else {
                        Files.copy(sourceFile.toPath(), Paths.get(target+sourceFile.getName()), StandardCopyOption.REPLACE_EXISTING);
                    }
                    break;
                case "move":
                    log.info("Move {} to {}", source, target);
                    move(sourceFile, target+sourceFile.getName());
                    break;
            }
        } catch (IOException e){
            log.error("Error while {} {} to {}", operationType, source, target, e);
        }
    }

    private void moveToTrash(String path) throws IOException {
        File fileToRemove = new File(path);
        if(!fileToRemove.exists()){
            throw new FileNotFoundException("File " + fileToRemove.getName() + " doesn't exist");
        }
        log.info("Move to trash dir {}", path);
        move(fileToRemove, getTrashPath()+fileToRemove.getName());
    }

    private void move(File sourceFile, String pathDest) throws IOException {
        if(sourceFile.isDirectory()){
            FileUtils.moveDirectory(sourceFile, new File(pathDest));
        } else {
            Files.move(sourceFile.toPath(), Paths.get(pathDest), StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private JSONObject getStateJson() {
        try {
            return new JSONObject(FileUtils.readFileToString(getStateFile(), StandardCharsets.UTF_8));
        }catch (IOException e){
            throw new RuntimeException("Error while reading state json file: ", e);
        }
    }

    private File getStateFile() {
        File stateJsonFile = new File(stateJsonPath);
        if(!stateJsonFile.exists()){
            log.warn(String.format("Didn't find a state file in %s; creating new from default", stateJsonFile));
            try(InputStream is = getDefaultStateFileIS()){
                FileUtils.copyInputStreamToFile(is, stateJsonFile);
            } catch (IOException e){
                throw new RuntimeException(e);
            }
        }
        return stateJsonFile;
    }

    private InputStream getDefaultStateFileIS(){
        if(System.getProperty("os.name").toLowerCase().contains("windows")){
            return this.getClass().getResourceAsStream(DEFAULT_STATE_PATH_WIN);
        } else {
            return this.getClass().getResourceAsStream(DEFAULT_STATE_PATH);
        }
    }

    private String getTrashPath(){
        JSONObject stateJson = getStateJson();
        JSONArray bookmarks = stateJson.getJSONArray("bookmarks");
        for(int i=0; i<bookmarks.length(); i++){
            if(bookmarks.getJSONObject(i).getString("name").equals(trashBookmark)){
                return bookmarks.getJSONObject(i).getString("path");
            }
        }
        throw new RuntimeException("Didn't find Trash bookmark");
    }

    private List<String> getCommand(String path){
        JSONObject stateJson = getStateJson();
        List<String> result = commandByExt(path, stateJson);
        if(result == null) {
            result = Optional.ofNullable(commandByMimeType(path, stateJson)).orElse(getDefaultCommand(stateJson));
        }
        result.add(path);
        return result;
    }

    private List<String> getDefaultCommand(JSONObject stateJson){
        return toList(stateJson.getJSONObject("commands").getJSONArray("default"));
    }

    private List<String> commandByExt(String path, JSONObject stateJson){
        String extension = util.FileUtils.getExtension(path);
        if(extension==null){
            return null;
        }
        JSONArray mappings = stateJson.getJSONObject("commands").getJSONArray("type-mappings");
        for(int i = 0; i<mappings.length(); i++){
            JSONObject mapping = mappings.getJSONObject(i);
            if(mapping.getString("match-type").equalsIgnoreCase("ext")
                    && toList(mapping.getJSONArray("type")).contains(extension)){
                return toList(mapping.getJSONArray("command"));
            }
        }
        return null;
    }

    private List<String> commandByMimeType(String path, JSONObject stateJson){
        String mimeType = util.FileUtils.getTypeMime(path);
        JSONArray mappings = stateJson.getJSONObject("commands").getJSONArray("type-mappings");
        for(int i = 0; i<mappings.length(); i++){
            JSONObject mapping = mappings.getJSONObject(i);
            if(mapping.getString("match-type").equalsIgnoreCase("mime")){
                if(mapping.get("match").equals("start")){
                    if(mimeType.startsWith((String) mapping.get("type"))){
                        return toList(mapping.getJSONArray("command"));
                    }
                } else {
                    if(mimeType.equalsIgnoreCase((String) mapping.get("type"))){
                        return toList(mapping.getJSONArray("command"));
                    }
                }
            }
        }
        return null;
    }

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
