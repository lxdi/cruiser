package com.sogoodlab.xyzfiles.dto;

public class FileUpdate {

    private String path;
    private String newName;
    private FileContent content;

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }

    public FileContent getContent() {
        return content;
    }

    public void setContent(FileContent content) {
        this.content = content;
    }
}
