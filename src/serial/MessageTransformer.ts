/**
 * Transformer for TextDecoder that breaks streaming data into messages up to the delimiter "~"
 */
export class MessageTransformer implements Transformer<string, string> {
  chunks = ''; // A container for holding stream data until a new message
  delimiter: string;

  constructor(delimiter = '~') {
    this.delimiter = delimiter;
  }

  transform(
    chunk: string,
    controller: TransformStreamDefaultController<string>
  ): void {
    // Append new chunks to existing chunks.
    this.chunks += chunk.trim();
    // For each line breaks in chunks, send the parsed lines out.
    const lines = this.chunks.split(this.delimiter);
    this.chunks = lines.pop() as string;
    lines.forEach(line => controller.enqueue(line));
  }

  flush(controller: TransformStreamDefaultController<string>): void {
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  }
}
