package util;

import java.io.File;

public class FileUtils {

    public static String getPath(File file){
        return (file.getParent().equals(File.separator)? File.separator: file.getParent())
                + File.separator
                + file.getName()
                + (file.isDirectory()? File.separator: "");
    }

}
