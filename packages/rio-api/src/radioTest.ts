import { pipeline } from "@huggingface/transformers";
import ffmpeg from "fluent-ffmpeg";
import got from "got";
import { PassThrough } from "stream";
import { WebSocket } from "ws";

const SAMPLE_RATE = 16000;
const CHUNK_SECONDS = 5;
const CHUNK_SIZE = SAMPLE_RATE * CHUNK_SECONDS;
const bytesPer32BitSample = 4;
if (!process.env.MODEL) {
  throw new Error("MODEL environment variable is not set");
}

// Shared buffer
export const floatBuffer: Float32Array[] = [];

export const initialiseClassifier = async () => {
  const classifier = await pipeline("audio-classification", process.env.MODEL);
  return classifier;
};

export const startStreamProducer = (url: string) => {
  const radioStream = got.stream(url);
  const ffmpegStream = new PassThrough();

  ffmpeg(radioStream)
    .format("f32le")
    .audioChannels(1)
    .audioFrequency(SAMPLE_RATE)
    .on("error", (err) => console.error("ffmpeg error:", err))
    .pipe(ffmpegStream);

  ffmpegStream.on("data", (chunk) => {
    const numOf32BitSamples = chunk.length / bytesPer32BitSample;
    floatBuffer.push(
      new Float32Array(chunk.buffer, chunk.byteOffset, numOf32BitSamples)
    );
  });
};

export const startStreamConsumer = async (socket: WebSocket) => {
  const classifier = await initialiseClassifier();

  setInterval(async () => {
    const bufferLength = floatBuffer.reduce((sum, arr) => sum + arr.length, 0);

    if (bufferLength < CHUNK_SIZE) return;

    const allSamples = new Float32Array(bufferLength);

    let offset = 0;
    for (const arr of floatBuffer) {
      allSamples.set(arr, offset);
      offset += arr.length;
    }

    const mostRecentChunk = allSamples.slice(allSamples.length - CHUNK_SIZE);

    // Clear the buffer
    floatBuffer.length = 0;

    const output = await classifier(mostRecentChunk);
    socket.send(JSON.stringify({ output }));
  }, CHUNK_SECONDS * 1000);
};
