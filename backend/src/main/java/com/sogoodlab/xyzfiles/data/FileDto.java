package com.sogoodlab.xyzfiles.data;

import util.FileUtils;

import java.io.File;

public class FileDto {

    String path;
    long lastModified;
    long size;

    public FileDto(String path, long lastModified, long size){
        this.path = path;
        this.lastModified = lastModified;
        this.size = size;
    }

    public static FileDto of(File file){
        return new FileDto(FileUtils.getPath(file), file.lastModified(), file.length());
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
}
