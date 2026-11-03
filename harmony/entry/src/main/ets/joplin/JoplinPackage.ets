/**
 * Registers the hand-written TurboModules that stand in for native modules
 * Joplin depends on but that have no HarmonyOS build.
 *
 * Mirrors the layout used by the published @react-native-oh-tpl packages: a
 * concrete factory class per package, returned from
 * createAnyThreadTurboModuleFactory.
 */

import {
  RNPackage,
  AnyThreadTurboModule,
  AnyThreadTurboModuleContext,
  AnyThreadTurboModuleFactory,
} from '@rnoh/react-native-openharmony/ts';
import { JoplinSQLiteModule } from './JoplinSQLiteModule';
import { JoplinFileSystemModule } from './JoplinFileSystemModule';
import { JoplinCryptoModule } from './JoplinCryptoModule';
import { JoplinI18nModule } from './JoplinI18nModule';

class JoplinTurboModulesFactory extends AnyThreadTurboModuleFactory {
  public createTurboModule(name: string): AnyThreadTurboModule | null {
    if (name === JoplinSQLiteModule.NAME) {
      return new JoplinSQLiteModule(this.ctx);
    }
    if (name === JoplinFileSystemModule.NAME) {
      return new JoplinFileSystemModule(this.ctx);
    }
    if (name === JoplinCryptoModule.NAME) {
      return new JoplinCryptoModule(this.ctx);
    }
    if (name === JoplinI18nModule.NAME) {
      return new JoplinI18nModule(this.ctx);
    }
    return null;
  }

  public hasTurboModule(name: string): boolean {
    return name === JoplinSQLiteModule.NAME || name === JoplinFileSystemModule.NAME || name === JoplinCryptoModule.NAME || name === JoplinI18nModule.NAME;
  }
}

export class JoplinPackage extends RNPackage {
  public createAnyThreadTurboModuleFactory(ctx: AnyThreadTurboModuleContext): AnyThreadTurboModuleFactory {
    return new JoplinTurboModulesFactory(ctx);
  }
}
