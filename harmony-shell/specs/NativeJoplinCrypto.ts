import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

// Implemented by harmony/entry/src/main/ets/joplin/JoplinCryptoModule.ets.
// Binary data is base64 encoded so the codegen surface stays primitive.
export interface Spec extends TurboModule {
	pbkdf2(password: string, salt: string, iterations: number, keyLength: number, digest: string): Promise<string>;
	digest(algorithm: string, data: string): string;
	randomBytes(size: number): string;
	encrypt(algorithm: string, key: string, iv: string, aad: string, data: string): string;
	decrypt(algorithm: string, key: string, iv: string, aad: string, data: string, authTag: string): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('JoplinCrypto');
