package util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class FileUtils {

    private static final Logger log = LoggerFactory.getLogger(FileUtils.class);

    public static String getPath(File file){
        return (file.getParent().equals(File.separator)? File.separator: file.getParent())
                + File.separator
                + file.getName()
                + (file.isDirectory()? File.separator: "");
    }

    public static String getExtension(String path){
        if(path.contains(".")){
            return path.substring(path.lastIndexOf("."));
        } else {
            return null;
        }
    }

    public static String getTypeMime(String path) {
        String mimeType = null;
        try {
            mimeType = Files.probeContentType(Paths.get(path));
        } catch (IOException e) {
            log.error("Error while reading mimetype on " + path, e);
        }
        return mimeType;
    }

}
