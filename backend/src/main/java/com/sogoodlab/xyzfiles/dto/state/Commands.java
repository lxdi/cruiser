package com.sogoodlab.xyzfiles.dto.state;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class Commands {

    @JsonProperty("default")
    private List<String> defaultCmd;

    @JsonProperty("type-mappings")
    private List<TypeMapping> typeMappings;

    public List<String> getDefaultCmd() {
        return defaultCmd;
    }

    public void setDefaultCmd(List<String> defaultCmd) {
        this.defaultCmd = defaultCmd;
    }

    public List<TypeMapping> getTypeMappings() {
        return typeMappings;
    }
    public void setTypeMappings(List<TypeMapping> typeMappings) {
        this.typeMappings = typeMappings;
    }

    public static class TypeMapping {
        private String match;
        private List<String> type;
        private List<String> command;

        @JsonProperty("match-type")
        private String matchType;

        public String getMatch() {
            return match;
        }

        public void setMatch(String match) {
            this.match = match;
        }

        public List<String> getType() {
            return type;
        }

        public void setType(List<String> type) {
            this.type = type;
        }

        public List<String> getCommand() {
            return command;
        }

        public void setCommand(List<String> command) {
            this.command = command;
        }

        public String getMatchType() {
            return matchType;
        }

        public void setMatchType(String matchType) {
            this.matchType = matchType;
        }
    }


}
