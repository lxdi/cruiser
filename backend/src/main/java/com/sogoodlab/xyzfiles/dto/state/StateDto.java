package com.sogoodlab.xyzfiles.dto.state;

import java.util.List;
import java.util.Map;

public class StateDto {

    private String system;
    private List<BookmarkDto> bookmarks;
    private Map<PanelDto.PanelDirection, PanelDto> panels;
    private Commands commands;




    public String getSystem() {
        return system;
    }

    public void setSystem(String system) {
        this.system = system;
    }

    public List<BookmarkDto> getBookmarks() {
        return bookmarks;
    }

    public void setBookmarks(List<BookmarkDto> bookmarks) {
        this.bookmarks = bookmarks;
    }

    public Map<PanelDto.PanelDirection, PanelDto> getPanels() {
        return panels;
    }

    public void setPanels(Map<PanelDto.PanelDirection, PanelDto> panels) {
        this.panels = panels;
    }

    public Commands getCommands() {
        return commands;
    }

    public void setCommands(Commands commands) {
        this.commands = commands;
    }
}
