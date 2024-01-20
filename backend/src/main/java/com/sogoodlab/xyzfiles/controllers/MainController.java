package com.sogoodlab.xyzfiles.controllers;

import com.sogoodlab.xyzfiles.dto.FileContent;
import com.sogoodlab.xyzfiles.dto.FileDto;
import com.sogoodlab.xyzfiles.util.TextExtensions;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class MainController {

    @PostMapping("/file/get/all")
    public List<FileDto> files(@RequestBody String path){
        path = path.replace("\"", "");
        final File folder = new File(path);
        return Arrays.stream(Optional.ofNullable(folder.listFiles()).orElse(new File[0]))
                .map(FileDto::of).collect(Collectors.toList());
    }

    @PostMapping("/file/get/content")
    public FileContent content(@RequestBody String path) throws IOException {
        path = path.replace("\"", "");
        final File file = new File(path);

        if(!TextExtensions.isTextContent(file.getName()) || file.isDirectory()){
            return new FileContent(null);
        }

        return new FileContent(Files.readString(file.toPath(), StandardCharsets.UTF_8));
    }

}
