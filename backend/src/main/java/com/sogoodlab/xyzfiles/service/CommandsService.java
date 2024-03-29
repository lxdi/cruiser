package com.sogoodlab.xyzfiles.service;

import com.sogoodlab.xyzfiles.dto.FileUpdate;
import com.sogoodlab.xyzfiles.dto.state.BookmarkDto;
import com.sogoodlab.xyzfiles.dto.state.Commands;
import com.sogoodlab.xyzfiles.dto.state.StateDto;
import com.sogoodlab.xyzfiles.util.JsonUtil;
import com.sogoodlab.xyzfiles.util.TextExtensions;
import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.swing.plaf.nimbus.State;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CommandsService {

    private Logger log = LoggerFactory.getLogger(StateService.class);

    @Value("${trash.bucket.bookmark}")
    private String trashBookmark;

    @Autowired
    private StateService stateService;

    public void open(String path){
        log.info("Opening: " + path);
        Runtime rt = Runtime.getRuntime();

        try {
            Process pr = rt.exec(JsonUtil.toArray(getCommand(path)));
        } catch (IOException e) {
            log.error("Error while opening command", e);
        }
    }

    public void createDir(String path){
        File dir = new File(path);
        if(!dir.exists()){
            log.info("Creating new directory {}", path);
            dir.mkdir();
        } else {
            log.error("Directory already exists {}", path);
        }
    }

    public void createTxtFile(FileUpdate fileUpdate){
        Path file = Paths.get(fileUpdate.getPath());

        if(new File(fileUpdate.getPath()).exists()){
            throw new RuntimeException("File "+ fileUpdate.getPath()+" already exists");
        }

        try {
            Files.write(file, List.of(fileUpdate.getContent().getContent()), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Error while creating txt file", e);
        }
    }

    public void copyMove(String source, String target, String operationType){
        File sourceFile = new File(source);
        try {
            if(target == null){
                throw new NullPointerException("Target is null");
            }
            switch (operationType) {
                case "copy":
                    log.info("Copy {} to {}", source, target);
                    if(sourceFile.isDirectory()){
                        FileUtils.copyDirectory(sourceFile, new File(target+sourceFile.getName()));
                    } else {
                        Files.copy(sourceFile.toPath(), Paths.get(target+sourceFile.getName()), StandardCopyOption.REPLACE_EXISTING);
                    }
                    break;
                case "move":
                    log.info("Move {} to {}", source, target);
                    move(sourceFile, target+sourceFile.getName());
                    break;
            }
        } catch (IOException e){
            log.error("Error while {} {} to {}", operationType, source, target, e);
        }
    }

    public void moveToTrash(String path) throws IOException {
        moveToTrash(path, UUID.randomUUID().toString());
    }

    public void moveToTrash(List<String> paths){
        String trashUniqueFolder = UUID.randomUUID().toString();
        for(String path : paths){
            try{
                moveToTrash(path, trashUniqueFolder);
            } catch (IOException e){
                log.error(e.getMessage(), e);
            }
        }
    }

    public void moveToTrash(String path, String trashFolderName) throws IOException {
        File fileToRemove = new File(path);
        if(!fileToRemove.exists()){
            throw new FileNotFoundException("File " + fileToRemove.getName() + " doesn't exist");
        }
        String folderInTrashBin = getTrashPath()+trashFolderName;
        File folderInTrashBinFile = new File(folderInTrashBin);
        if(!folderInTrashBinFile.exists() && !folderInTrashBinFile.mkdir()){
            throw new RuntimeException("Couldn't create folder in trash bin: "+ folderInTrashBin);
        }
        log.info("Move to trash dir {}", path);
        move(fileToRemove,  folderInTrashBin + File.separator + fileToRemove.getName());
    }

    public void update(FileUpdate fileUpdate){
        File file = new File(fileUpdate.getPath());
        String newName = fileUpdate.getNewName();
        String newPath = file.getParent()+File.separator+newName;
        log.info("Rename {} to {}", file.getAbsoluteFile(), newPath);

        try {
            Files.move(file.toPath(), Paths.get(newPath));
        } catch (IOException e) {
            log.error("Error while renaming", e);
        }

        if(fileUpdate.getContent()!=null && fileUpdate.getContent().getContent()!=null && TextExtensions.isTextContent(newPath)){
            try {
                FileUtils.writeStringToFile(new File(newPath), fileUpdate.getContent().getContent(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                log.error("Error while updating content for file {}", newPath, e);
            }
        }
    }

    private void move(File sourceFile, String pathDest) throws IOException {
        if(sourceFile.isDirectory()){
            FileUtils.moveDirectory(sourceFile, new File(pathDest));
        } else {
            Files.move(sourceFile.toPath(), Paths.get(pathDest), StandardCopyOption.REPLACE_EXISTING);
        }
    }

    public String getTrashPath(){
        StateDto state = stateService.getState();
        List<BookmarkDto> bookmarks = state.getBookmarks();

        for(BookmarkDto bm : bookmarks) {
            if(bm.getName().equals(trashBookmark)){
                return bm.getPath();
            }
        }

        throw new RuntimeException("Didn't find Trash bookmark");
    }

    public List<String> getCommand(String path){
        StateDto state = stateService.getState();
        List<String> result = commandByExt(path, state);

        if(result == null) {
            result = Optional.ofNullable(commandByMimeType(path, state)).orElse(state.getCommands().getDefaultCmd());
        }

        result.add(path);
        return result;
    }

    private List<String> commandByExt(String path, StateDto state){
        String extension = util.FileUtils.getExtension(path);

        if(extension==null){
            return null;
        }

        var mappings = state.getCommands().getTypeMappings();

        for(Commands.TypeMapping tm : mappings) {
            if(tm.getMatchType().equalsIgnoreCase("ext") && tm.getType().contains(extension)){
                return tm.getCommand();
            }
        }

        return null;
    }

    private List<String> commandByMimeType(String path, StateDto state){
        String mimeType = util.FileUtils.getTypeMime(path);

        if(mimeType==null){
            return null;
        }

        for(Commands.TypeMapping tm : state.getCommands().getTypeMappings()) {

            if(!tm.getMatchType().equalsIgnoreCase("mime")) {
                continue;
            }

            if (tm.getMatch().equals("start") && tm.getType().stream().anyMatch(mimeType::startsWith)) {
                    return tm.getCommand();
            }

            if (tm.getMatch().equals("equals") && tm.getType().stream().anyMatch(mimeType::equalsIgnoreCase)) {
                    return tm.getCommand();
            }
        }

        return null;
    }
}
