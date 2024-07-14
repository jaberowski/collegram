import { envManager } from "../../main";
import multer, { FileFilterCallback, MulterError } from "multer";
import { HttpError } from "../../utility/http-error";
import { EnvManager } from "../../utility/EnvManager";
import { Request, RequestHandler } from "express";

class Upload {
  private uploadDir = EnvManager.getInstance().get("UPLOAD_DIR");
  private maxFileSize = 10_000_000;
  private mimeTypes = ["image/jpeg", "image/png"];
  private storage = multer.diskStorage({
    destination: this.uploadDir,
    filename(req, file, callback) {
      callback(null, Date.now() + "-" + file.originalname);
    },
  });

  public uploadAvatar() {
    return this.wrapper(this.getMulter().single("avatar"));
  }

  public uploadPostImages() {
    return this.wrapper(this.getMulter().array("postImages", 6));
  }

  private getMulter() {
    return multer({
      storage: this.storage,
      fileFilter: this.fileFilter(),
      limits: { fileSize: this.maxFileSize },
    });
  }

  private fileFilter() {
    return (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      if (!this.mimeTypes.includes(file.mimetype)) {
        cb(new UnsupportedMediaError());
      }

      cb(null, true);
    };
  }
  private wrapper(handler: RequestHandler): RequestHandler {
    return (req, res, next) => {
      handler(req, res, (error: unknown) => {
        if (error instanceof MulterError) {
          next(this.multerErrorMapper(error));
        } else if (error) {
          next(error);
        }
        return next();
      });
    };
  }

  private multerErrorMapper(error: MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return new LargeFileUpload();

      case "LIMIT_FILE_COUNT":
        return new QuantityFileError();

      case "LIMIT_UNEXPECTED_FILE":
        return new UnsupportedMediaError();

      default:
        return error;
    }
  }
}

export const upload = new Upload();

export class UploadError extends Error {
  constructor(public code: number, public message: string) {
    super(message);
  }
}

class LargeFileUpload extends UploadError {
  constructor() {
    super(413, "uploaded file is too big");
  }
}

class QuantityFileError extends UploadError {
  constructor() {
    super(413, "the number of uploaded files isnt in the specified range");
  }
}

class UnsupportedMediaError extends UploadError {
  constructor() {
    super(415, "file uploaded is in wrong format");
  }
}
