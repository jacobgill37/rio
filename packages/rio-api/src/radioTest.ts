import { pipeline } from "@huggingface/transformers";
import ffmpeg from "fluent-ffmpeg";
import got from "got";
import { PassThrough } from "stream";
import { WebSocket } from "ws";

const SAMPLE_RATE = 16000;
const CHUNK_SECONDS = 10;
const CHUNK_SIZE = SAMPLE_RATE * CHUNK_SECONDS;

export const initialiseClassifier = async () => {
  const model = "/home/jacob/repos/rio/packages/rio-api/models/rio-model-onnx";
  const classifier = await pipeline("audio-classification", model);
  return classifier;
};

export const analyseStream = async (url: string, socket: WebSocket) => {
  const classifier = await initialiseClassifier();
  const radioStream = got.stream(url);
  const ffmpegStream = new PassThrough();

  ffmpeg(radioStream)
    .format("f32le")
    .audioChannels(1)
    .audioFrequency(SAMPLE_RATE)
    .on("error", (err) => console.error("ffmpeg error:", err))
    .pipe(ffmpegStream);

  let floatBuffer: Float32Array[] = [];
  let processing = false;

  ffmpegStream.on("data", async (chunk) => {
    floatBuffer.push(
      new Float32Array(chunk.buffer, chunk.byteOffset, chunk.length / 4)
    );

    if (processing) return;

    processing = true;
    try {
      while (true) {
        const totalLength = floatBuffer.reduce(
          (sum, arr) => sum + arr.length,
          0
        );

        if (totalLength < CHUNK_SIZE) break;

        const chunkToProcess = processChunks(totalLength, floatBuffer);

        const output = await classifier(chunkToProcess);

        socket.send(JSON.stringify({ output }));
      }
    } finally {
      processing = false;
    }
  });
};

const processChunks = (totalLength: number, floatBuffer: Float32Array[]) => {
  let allChunks = new Float32Array(totalLength);
  let offset = 0;

  for (const arr of floatBuffer) {
    allChunks.set(arr, offset);
    offset += arr.length;
  }

  const chunkToProcess = allChunks.slice(0, CHUNK_SIZE);

  const leftovers = allChunks.slice(CHUNK_SIZE);
  floatBuffer = leftovers.length ? [leftovers] : [];

  return chunkToProcess;
};
