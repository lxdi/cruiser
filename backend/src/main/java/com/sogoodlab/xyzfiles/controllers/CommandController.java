package com.sogoodlab.xyzfiles.controllers;

import com.sogoodlab.xyzfiles.dto.FileDto;
import com.sogoodlab.xyzfiles.dto.FileUpdate;
import com.sogoodlab.xyzfiles.dto.FilesMoving;
import com.sogoodlab.xyzfiles.service.CommandsService;
import com.sogoodlab.xyzfiles.service.StateService;
import com.sogoodlab.xyzfiles.util.TextExtensions;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path="/command")
public class CommandController {

    private Logger log = LoggerFactory.getLogger(CommandController.class);

    @Autowired
    private StateService stateService;

    @Autowired
    private CommandsService commandsServices;

    @PostMapping("/open")
    public void open(@RequestBody String path) throws IOException {
        commandsServices.open(path.replace("\"", ""));
    }

    @PostMapping("/trash/move")
    public void delete(@RequestBody FileDto file) throws IOException {
        commandsServices.moveToTrash(file.getPath());
    }

    @PostMapping("/trash/move/multiple")
    public void multiDelete(@RequestBody List<FileDto> files){
        commandsServices.moveToTrash(files.stream()
                .map(FileDto::getPath)
                .collect(Collectors.toList()));
    }

    @PostMapping("/trash/clean")
    public void cleanTrash() throws IOException {
        FileUtils.cleanDirectory(new File(commandsServices.getTrashPath()));
    }

    @PostMapping("/copy")
    public void copy(@RequestBody FilesMoving requisites) throws IOException {
        List<String> pathsSource = requisites.getFrom();
        String targetPath = requisites.getTo();
        pathsSource.forEach(path -> commandsServices.copyMove(path, targetPath, "copy"));
    }

    @PostMapping("/move")
    public void move(@RequestBody FilesMoving requisites) throws IOException {
        List<String> pathsSource = requisites.getFrom();
        String targetPath = requisites.getTo();
        pathsSource.forEach(path -> commandsServices.copyMove(path, targetPath, "move"));
    }

    @PostMapping("/update")
    public void update(@RequestBody FileUpdate requisites) throws IOException {
        commandsServices.update(requisites);
    }

    @PutMapping("/dir")
    public void createDir(@RequestBody String path){
        commandsServices.createDir(path.replace("\"", ""));
    }

    @PutMapping("/file")
    public void createFile(@RequestBody FileUpdate fileUpdate){
        if(!TextExtensions.isTextContent(fileUpdate.getPath())){
            throw new RuntimeException("Not a txt file to create");
        }
        commandsServices.createTxtFile(fileUpdate);
    }

    @PostMapping("/download")
    public ResponseEntity<Resource> download(@RequestBody String pathStr) throws IOException {

        File file = new File(pathStr.replace("\"", ""));

        if(!file.exists()){
            throw new FileNotFoundException(file.getPath());
        }

        log.info("Downloading: {}", file.getPath());
        Path path = file.toPath();
        ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(path));

        return ResponseEntity.ok()
                .headers(new HttpHeaders())
                .contentLength(file.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}
