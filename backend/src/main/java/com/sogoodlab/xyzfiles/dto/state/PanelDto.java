package com.sogoodlab.xyzfiles.dto.state;

import java.util.List;

public class PanelDto {

    public enum PanelDirection {
        left, right
    }

    private List<String> tabs;
    private int current;

    public List<String> getTabs() {
        return tabs;
    }

    public void setTabs(List<String> tabs) {
        this.tabs = tabs;
    }

    public int getCurrent() {
        return current;
    }

    public void setCurrent(int current) {
        this.current = current;
    }
}
