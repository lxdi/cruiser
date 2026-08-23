package com.sogoodlab.xyzfiles.controllers;

import com.sogoodlab.xyzfiles.service.ContentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping(path="/content")
public class ContentController {

    Logger log = LoggerFactory.getLogger(ContentController.class);

    @Autowired
    private ContentService contentService;

    @GetMapping
    public String state(@RequestParam(value = "path", defaultValue = "") String path) throws IOException {
        return contentService.getContent(path);
    }

    @PostMapping
    public @ResponseBody String update(@RequestParam(value = "path", defaultValue = "") String path, @RequestBody String body) throws IOException {
        contentService.updateContent(path,body);
        return "OK";
    }

}
