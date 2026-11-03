/**
 * File system TurboModule backed by @kit.CoreFileKit.
 *
 * Contents cross the bridge as strings so binary data is always base64 encoded
 * and structured results are JSON. Paths are sandbox paths under the app's
 * el2 directory, which is what Joplin expects on mobile.
 */

import { AnyThreadTurboModule, AnyThreadTurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { fileIo as fs } from '@kit.CoreFileKit';
import { util } from '@kit.ArkTS';
import { common } from '@kit.AbilityKit';
import { cryptoFramework } from '@kit.CryptoArchitectureKit';

interface DirInfo {
  files: string;
  cache: string;
  temp: string;
}

interface StatInfo {
  isDirectory: boolean;
  size: number;
  mtime: number;
  birthtime: number;
  path: string;
  name: string;
}

const textEncoder = new util.TextEncoder();
const textDecoder = util.TextDecoder.create('utf-8');

export class JoplinFileSystemModule extends AnyThreadTurboModule {
  public static readonly NAME = 'JoplinFileSystem';

  public constructor(ctx: AnyThreadTurboModuleContext) {
    super(ctx);
  }

  private context(): common.UIAbilityContext {
    return this.ctx.uiAbilityContext as common.UIAbilityContext;
  }

  private toBytes(content: string, encoding: string): Uint8Array {
    if (encoding === 'base64') {
      return new Uint8Array(new util.Base64Helper().decodeSync(content));
    }
    return textEncoder.encodeInto(content);
  }

  // fs.writeSync only accepts ArrayBuffer|string; passing the Uint8Array view
  // itself silently writes nothing.
  private writeBytes(fd: number, bytes: Uint8Array): void {
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    fs.writeSync(fd, buffer as ArrayBuffer);
  }

  private fromBytes(bytes: Uint8Array, encoding: string): string {
    if (encoding === 'base64') {
      return new util.Base64Helper().encodeToStringSync(bytes);
    }
    const copy = new Uint8Array(bytes.length);
    copy.set(bytes);
    return textDecoder.decodeToString(copy);
  }

  private readAllBytes(path: string): Uint8Array {
    const file = fs.openSync(path, fs.OpenMode.READ_ONLY);
    try {
      const stat = fs.statSync(path);
      if (stat.size === 0) {
        return new Uint8Array(0);
      }
      const buffer = new ArrayBuffer(stat.size);
      const read = fs.readSync(file.fd, buffer, { offset: 0, length: stat.size });
      return new Uint8Array(buffer.slice(0, read));
    } finally {
      fs.closeSync(file);
    }
  }

  private ensureParentDirectory(path: string): void {
    const index = path.lastIndexOf('/');
    if (index <= 0) {
      return;
    }
    this.mkdirRecursive(path.substring(0, index));
  }

  private mkdirRecursive(path: string): void {
    if (!path || path === '/' || fs.accessSync(path)) {
      return;
    }
    this.mkdirRecursive(path.substring(0, path.lastIndexOf('/')));
    fs.mkdirSync(path);
  }

  private statToJson(stat: fs.Stat, path: string): string {
    const nameIndex = path.lastIndexOf('/');
    const info: StatInfo = {
      isDirectory: stat.isDirectory(),
      size: stat.size,
      mtime: stat.mtime * 1000,
      birthtime: stat.ctime * 1000,
      path: path,
      name: path.substring(nameIndex + 1),
    };
    return JSON.stringify(info);
  }

  // rn-fetch-blob exposes its directories as a plain object at import time, so
  // the JS shim needs a synchronous accessor.
  public getDirectoriesSync(): string {
    const context = this.context();
    const info: DirInfo = {
      files: context.filesDir,
      cache: context.cacheDir,
      temp: context.tempDir,
    };
    return JSON.stringify(info);
  }

  public async getDirectories(): Promise<string> {
    return this.getDirectoriesSync();
  }

  public async exists(path: string): Promise<boolean> {
    return fs.accessSync(path);
  }

  public async stat(path: string): Promise<string> {
    if (!fs.accessSync(path)) {
      return '';
    }
    return this.statToJson(fs.statSync(path), path);
  }

  public async readDir(path: string): Promise<string> {
    const names = fs.listFileSync(path);
    const entries: StatInfo[] = [];
    for (const name of names) {
      const childPath = `${path}/${name}`;
      const stat = fs.statSync(childPath);
      entries.push({
        isDirectory: stat.isDirectory(),
        size: stat.size,
        mtime: stat.mtime * 1000,
        birthtime: stat.ctime * 1000,
        path: childPath,
        name: name,
      });
    }
    return JSON.stringify(entries);
  }

  public async mkdir(path: string): Promise<void> {
    this.mkdirRecursive(path);
  }

  public async unlink(path: string): Promise<void> {
    this.removeRecursive(path);
  }

  // Matches RNFS.unlink, which is rm -rf: Joplin relies on it to wipe directories.
  private removeRecursive(path: string): void {
    if (!fs.accessSync(path)) {
      return;
    }
    if (fs.statSync(path).isDirectory()) {
      for (const name of fs.listFileSync(path)) {
        this.removeRecursive(`${path}/${name}`);
      }
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path);
    }
  }

  public async moveFile(source: string, dest: string): Promise<void> {
    this.ensureParentDirectory(dest);
    fs.renameSync(source, dest);
  }

  public async copyFile(source: string, dest: string): Promise<void> {
    this.ensureParentDirectory(dest);
    if (fs.accessSync(dest)) {
      fs.unlinkSync(dest);
    }
    fs.copyFileSync(source, dest);
  }

  public async readFile(path: string, encoding: string): Promise<string> {
    return this.fromBytes(this.readAllBytes(path), encoding);
  }

  public async read(path: string, offset: number, length: number, encoding: string): Promise<string> {
    const file = fs.openSync(path, fs.OpenMode.READ_ONLY);
    try {
      const buffer = new ArrayBuffer(length);
      const read = fs.readSync(file.fd, buffer, { offset: offset, length: length });
      return this.fromBytes(new Uint8Array(buffer.slice(0, read)), encoding);
    } finally {
      fs.closeSync(file);
    }
  }

  public async writeFile(path: string, content: string, encoding: string): Promise<void> {
    const bytes = this.toBytes(content, encoding);
    this.ensureParentDirectory(path);
    const file = fs.openSync(path, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE | fs.OpenMode.TRUNC);
    try {
      this.writeBytes(file.fd, bytes);
    } finally {
      fs.closeSync(file);
    }
  }

  public async appendFile(path: string, content: string, encoding: string): Promise<void> {
    const bytes = this.toBytes(content, encoding);
    this.ensureParentDirectory(path);
    const file = fs.openSync(path, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE | fs.OpenMode.APPEND);
    try {
      this.writeBytes(file.fd, bytes);
    } finally {
      fs.closeSync(file);
    }
  }

  public async hash(path: string, algorithm: string): Promise<string> {
    const bytes = this.readAllBytes(path);
    const md = cryptoFramework.createMd(algorithm.toUpperCase());
    await md.update({ data: bytes });
    const digest = await md.digest();
    let hex = '';
    const data = new Uint8Array(digest.data);
    for (let i = 0; i < data.length; i++) {
      hex += data[i].toString(16).padStart(2, '0');
    }
    return hex;
  }
}
