package com.sogoodlab.xyzfiles.data;

import java.io.File;

public class FileDto {

    String name;
    String path;
    boolean isDir;
    long lastModified;
    long size;

    public FileDto(String name, String path, boolean isDir, long lastModified, long size){
        this.name = name;
        this.path = path;
        this.isDir = isDir;
        this.lastModified = lastModified;
        this.size = size;
    }

    public static FileDto of(File file){
        return new FileDto(file.getName(), file.getParent().equals(File.separator)? File.separator:file.getParent()+File.separator,
                file.isDirectory(), file.lastModified(), file.length());
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }

    public boolean getIsDir() {
        return isDir;
    }

    public long getLastModified() {
        return lastModified;
    }

    public long getSize() {
        return size;
    }
}
