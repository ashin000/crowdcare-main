import { uploadMediaFile, validateFile } from "../firebase/storage";

export const uploadService = {
  uploadFile: uploadMediaFile,
  validateFile
};

export default uploadService;
