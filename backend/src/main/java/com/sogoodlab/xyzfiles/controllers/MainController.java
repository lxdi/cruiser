package com.sogoodlab.xyzfiles.controllers;

import com.sogoodlab.xyzfiles.dto.FileDto;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class MainController {

    @PostMapping("/file/get/all")
    public List<FileDto> files(@RequestBody String path){
        final File folder = new File(path);
        return Arrays.stream(Optional.ofNullable(folder.listFiles()).orElse(new File[0]))
                .map(FileDto::of).collect(Collectors.toList());
    }

}
