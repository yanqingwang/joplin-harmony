/**
 * Cryptography TurboModule for Joplin's E2EE (KeyV1 / StringV1 / FileV1).
 *
 * react-native-quick-crypto has no HarmonyOS build, so the JS shim forwards the
 * primitives Joplin needs here. Binary data crosses the bridge as base64
 * strings.
 */

import { AnyThreadTurboModule, AnyThreadTurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { cryptoFramework } from '@kit.CryptoArchitectureKit';
import { util } from '@kit.ArkTS';

interface CipherResult {
  ct: string;
  tag: string;
}

const AUTH_TAG_LENGTH = 16;

const base64 = new util.Base64Helper();

const decode = (value: string): Uint8Array => {
  if (value.length === 0) {
    return new Uint8Array(0);
  }
  return new Uint8Array(base64.decodeSync(value));
};

const encode = (bytes: Uint8Array): string => {
  return base64.encodeToStringSync(bytes);
};

// HarmonyOS spells digests without separators ("SHA512"), Node accepts both.
const normalizeDigest = (name: string): string => {
  return name.split('-').join('').split('_').join('').toUpperCase();
};

// aes-256-gcm -> AES256
const keySpec = (algorithm: string): string[] => {
  const parts = algorithm.split('-');
  return [`AES${parts[1]}`, `${parts[0].toUpperCase()}${parts[1]}|${parts[2].toUpperCase()}|NoPadding`];
};

const pbkdf2Impl = async (password: string, salt: string, iterations: number, keyLength: number, digest: string): Promise<string> => {
  const kdf = cryptoFramework.createKdf(`PBKDF2|${normalizeDigest(digest)}`);
  const spec: cryptoFramework.PBKDF2Spec = {
    algName: 'PBKDF2',
    password: decode(password),
    salt: decode(salt),
    iterations: iterations,
    keySize: keyLength,
  };
  const secret = await kdf.generateSecret(spec);
  return encode(secret.data);
};

const digestImpl = (algorithm: string, data: string): string => {
  const md = cryptoFramework.createMd(normalizeDigest(algorithm));
  const input = decode(data);
  // updateSync rejects an empty DataBlob.
  if (input.length > 0) {
    md.updateSync({ data: input });
  }
  return encode(md.digestSync().data);
};

const randomBytesImpl = (size: number): string => {
  return encode(cryptoFramework.createRandom().generateRandomSync(size).data);
};

const encryptImpl = (algorithm: string, key: string, iv: string, aad: string, data: string): CipherResult => {
  const spec = keySpec(algorithm);
  const keyObject = cryptoFramework.createSymKeyGenerator(spec[0]).convertKeySync({ data: decode(key) });
  const cipher = cryptoFramework.createCipher(spec[1]);
  const params: cryptoFramework.GcmParamsSpec = {
    algName: 'GcmParamsSpec',
    iv: { data: decode(iv) },
    aad: { data: decode(aad) },
    authTag: { data: new Uint8Array(AUTH_TAG_LENGTH) },
  };
  cipher.initSync(cryptoFramework.CryptoMode.ENCRYPT_MODE, keyObject, params);

  const input = decode(data);
  const output = cipher.doFinalSync(input.length > 0 ? { data: input } : null).data;
  const result: CipherResult = {
    // In GCM mode the last 16 bytes of the output are the auth tag.
    ct: encode(output.slice(0, output.length - AUTH_TAG_LENGTH)),
    tag: encode(output.slice(output.length - AUTH_TAG_LENGTH)),
  };
  return result;
};

const decryptImpl = (algorithm: string, key: string, iv: string, aad: string, data: string, authTag: string): string => {
  const spec = keySpec(algorithm);
  const keyObject = cryptoFramework.createSymKeyGenerator(spec[0]).convertKeySync({ data: decode(key) });
  const cipher = cryptoFramework.createCipher(spec[1]);
  const params: cryptoFramework.GcmParamsSpec = {
    algName: 'GcmParamsSpec',
    iv: { data: decode(iv) },
    aad: { data: decode(aad) },
    authTag: { data: decode(authTag) },
  };
  cipher.initSync(cryptoFramework.CryptoMode.DECRYPT_MODE, keyObject, params);

  const input = decode(data);
  return encode(cipher.doFinalSync(input.length > 0 ? { data: input } : null).data);
};

export class JoplinCryptoModule extends AnyThreadTurboModule {
  public static readonly NAME = 'JoplinCrypto';

  public constructor(ctx: AnyThreadTurboModuleContext) {
    super(ctx);
  }

  // PBKDF2 with 220000 iterations would block the JS thread, so it is async.
  public async pbkdf2(password: string, salt: string, iterations: number, keyLength: number, digest: string): Promise<string> {
    return pbkdf2Impl(password, salt, iterations, keyLength, digest);
  }

  public digest(algorithm: string, data: string): string {
    return digestImpl(algorithm, data);
  }

  public randomBytes(size: number): string {
    return randomBytesImpl(size);
  }

  public encrypt(algorithm: string, key: string, iv: string, aad: string, data: string): string {
    return JSON.stringify(encryptImpl(algorithm, key, iv, aad, data));
  }

  public decrypt(algorithm: string, key: string, iv: string, aad: string, data: string, authTag: string): string {
    return decryptImpl(algorithm, key, iv, aad, data, authTag);
  }
}
