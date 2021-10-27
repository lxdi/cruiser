package com.sogoodlab.xyzfiles.dto;

import java.util.List;

public class FilesMoving {

    private List<String> from;
    private String to;

    public List<String> getFrom() {
        return from;
    }

    public void setFrom(List<String> from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }
}
