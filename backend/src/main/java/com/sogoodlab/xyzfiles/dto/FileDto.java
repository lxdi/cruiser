package com.sogoodlab.xyzfiles.dto;

import util.FileUtils;

import java.io.File;

public class FileDto {

    private String path;
    private long lastModified;
    private long size;
    private String mime;

    public FileDto() {}

    public FileDto(String path, long lastModified, long size, String mime){
        this.path = path;
        this.lastModified = lastModified;
        this.size = size;
        this.mime = mime;
    }

    public static FileDto of(File file){
        return new FileDto(FileUtils.getPath(file),
                file.lastModified(),
                file.length(),
                (!file.isDirectory()? util.FileUtils.getTypeMime(file.getName()): "dir"));
    }

    public String getPath() {
        return path;
    }
    public long getLastModified() {
        return lastModified;
    }
    public long getSize() {
        return size;
    }
    public String getMime() {
        return mime;
    }
}
