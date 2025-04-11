import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import HashMap "mo:map/Map";
import { phash; thash } "mo:map/Map";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Option "mo:base/Option";

persistent actor Filevault {

  // Define a data type for a file's chunks.
  type FileChunk = {
    chunk : Blob;
    index : Nat;
  };

  // Define a data type for a file's data.
  type File = {
    name : Text;
    title : Text;              // New field
    content : Text;            // New field
    additionalContent : Text;   // New field
    remarks : Text;            // New field
    chunks : [FileChunk];
    totalSize : Nat;
    fileType : Text;
  };

  // Define a data type for storing files associated with a user principal.
  type UserFiles = HashMap.Map<Text, File>;

  // HashMap to store the user data
  private var files = HashMap.new<Principal, UserFiles>();

  // Return files associated with a user's principal.
  private func getUserFiles(user : Principal) : UserFiles {
    switch (HashMap.get(files, phash, user)) {
      case null {
        let newFileMap = HashMap.new<Text, File>();
        let _ = HashMap.put(files, phash, user, newFileMap);
        newFileMap;
      };
      case (?existingFiles) existingFiles;
    };
  };

  // Check if a file name already exists for the user.
  public shared (msg) func checkFileExists(name : Text) : async Bool {
    Option.isSome(HashMap.get(getUserFiles(msg.caller), thash, name));
  };

  // Upload a file in chunks.
  public shared (msg) func uploadFileChunk(
    name : Text,
    title : Text,              // New parameter
    content : Text,            // New parameter
    additionalContent : Text,   // New parameter
    remarks : Text,            // New parameter
    chunk : Blob,
    index : Nat,
    fileType : Text
  ) : async () {
    let userFiles = getUserFiles(msg.caller);
    let fileChunk = { chunk = chunk; index = index };

    switch (HashMap.get(userFiles, thash, name)) {
      case null {
        let _ = HashMap.put(
          userFiles,
          thash,
          name,
          {
            name = name;
            title = title;
            content = content;
            additionalContent = additionalContent;
            remarks = remarks;
            chunks = [fileChunk];
            totalSize = chunk.size();
            fileType = fileType;
          }
        );
      };
      case (?existingFile) {
        let updatedChunks = Array.append(existingFile.chunks, [fileChunk]);
        let _ = HashMap.put(
          userFiles,
          thash,
          name,
          {
            name = name;
            title = title;                    // Update with new value
            content = content;                // Update with new value
            additionalContent = additionalContent; // Update with new value
            remarks = remarks;                // Update with new value
            chunks = updatedChunks;
            totalSize = existingFile.totalSize + chunk.size();
            fileType = fileType;
          }
        );
      };
    };
  };

  // Return list of files for a user.
  public shared (msg) func getFiles() : async [{
    name : Text;
    title : Text;              // New field
    content : Text;            // New field
    additionalContent : Text;   // New field
    remarks : Text;            // New field
    size : Nat;
    fileType : Text;
  }] {
    Iter.toArray(
      Iter.map(
        HashMap.vals(getUserFiles(msg.caller)),
        func(file : File) : {
          name : Text;
          title : Text;
          content : Text;
          additionalContent : Text;
          remarks : Text;
          size : Nat;
          fileType : Text;
        } {
          {
            name = file.name;
            title = file.title;
            content = file.content;
            additionalContent = file.additionalContent;
            remarks = file.remarks;
            size = file.totalSize;
            fileType = file.fileType;
          };
        }
      )
    );
  };

  // Return total chunks for a file
  public shared (msg) func getTotalChunks(name : Text) : async Nat {
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null 0;
      case (?file) file.chunks.size();
    };
  };

  // Return specific chunk for a file.
  public shared (msg) func getFileChunk(name : Text, index : Nat) : async ?Blob {
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null null;
      case (?file) {
        switch (Array.find(file.chunks, func(chunk : FileChunk) : Bool { chunk.index == index })) {
          case null null;
          case (?foundChunk) ?foundChunk.chunk;
        };
      };
    };
  };

  // Get file's type.
  public shared (msg) func getFileType(name : Text) : async ?Text {
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null null;
      case (?file) ?file.fileType;
    };
  };

  // Get file's metadata (new function to retrieve title, content, etc.).
  public shared (msg) func getFileMetadata(name : Text) : async ?{
    title : Text;
    content : Text;
    additionalContent : Text;
    remarks : Text;
  } {
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null null;
      case (?file) ?{
        title = file.title;
        content = file.content;
        additionalContent = file.additionalContent;
        remarks = file.remarks;
      };
    };
  };

  // Delete a file.
  public shared (msg) func deleteFile(name : Text) : async Bool {
    Option.isSome(HashMap.remove(getUserFiles(msg.caller), thash, name));
  };
};