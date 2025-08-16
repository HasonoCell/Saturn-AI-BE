export interface InitUploadParams {
  fileName: string;
  fileSize: number;
  totalChunks: number;
  md5Hash: string;
}

export interface InitUploadResponse {
  uploadId: string;
  tempDir: string;
  uploadedChunks?: number[]; // 已上传的切片列表 (断点续传)
}

export interface UploadChunkParams {
  uploadId: string;
  chunkIndex: number;
  chunk: Buffer; // multer处理后的文件buffer
}

export interface MergeChunksParams {
  uploadId: string;
}

export interface MergeChunksResponse {
  success: boolean;
  fileId?: string;
  filePath?: string;
  fileUrl?: string;
}

export interface UploadEvent {
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  md5Hash: string;
  uploadedChunks: number[];
  status: "uploading" | "completed" | "failed";
  tempDir: string;
  createdAt: Date;
}
