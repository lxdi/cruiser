package com.sogoodlab.xyzfiles.service;

import com.sogoodlab.xyzfiles.controllers.ContentController;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class ContentService {

    Logger log = LoggerFactory.getLogger(ContentController.class);

    public static String DEFAULT_INIT_PATH = "/default/init.json";

    @Value("${root.path}")
    private String rootPath;

    public String getContent(String path) throws IOException {
        log.info("Path: {}", path);

        if (path == null || path.isEmpty()) {
            return new String(this.getClass().getResourceAsStream(DEFAULT_INIT_PATH).readAllBytes(), StandardCharsets.UTF_8);
        }

        var presetPath = path.startsWith("/")? "": rootPath;
        File contentFile = new File(presetPath + path);

        if(contentFile.exists()){
            return FileUtils.readFileToString(contentFile, StandardCharsets.UTF_8);
        }

        //log.warn(String.format("Didn't find a file in %s; creating new from default", contentFile));
        log.warn(String.format("File not found in %s", contentFile));

        throw new RuntimeException("File not found");
    }

    public void updateContent(String path, String content) throws IOException {

        if (path == null || path.isEmpty()) {
            log.warn("Path is null -> content was not updated");
            return;
        }

        var presetPath = path.startsWith("/")? "": rootPath;
        File contentFile = new File(presetPath + path);

        try (InputStream is = new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8))) {
            FileUtils.copyInputStreamToFile(is, contentFile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
