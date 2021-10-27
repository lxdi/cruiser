package com.sogoodlab.xyzfiles.util;

public class TextExtensions {

    private static final String[] CONTENT_EDIT_EXTENSIONS = {"txt", "java", "js", "yml", "yaml", "properties",
            "gradle", "py", "json"};

    public static boolean isTextContent(String name){
        for(String ext : CONTENT_EDIT_EXTENSIONS){
            if(name.endsWith("."+ext)){
                return true;
            }
        }
        return false;
    }

}
