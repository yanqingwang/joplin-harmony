/**
 * Device locale TurboModule backed by @ohos.i18n.
 *
 * react-native-localize has no HarmonyOS build, so the shim can't read the real
 * device language. Joplin's first-start locale detection calls getLocales()
 * and stores the result in settings, so the value returned here decides the
 * UI language for the lifetime of the installation.
 */

import { AnyThreadTurboModule, AnyThreadTurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { i18n } from '@kit.LocalizationKit';

interface LocaleInfo {
  countryCode: string;
  isRTL: boolean;
  languageCode: string;
  languageTag: string;
}

export class JoplinI18nModule extends AnyThreadTurboModule {
  public static readonly NAME = 'JoplinI18n';

  public constructor(ctx: AnyThreadTurboModuleContext) {
    super(ctx);
  }

  private static toLocaleInfo(languageTag: string): LocaleInfo {
    const parts = languageTag.split(/[-_]/);
    const languageCode = parts[0] ?? 'en';
    const countryCode = parts[1] ?? '';
    const isRTL = ['ar', 'fa', 'he', 'ur'].includes(languageCode);
    return { countryCode, isRTL, languageCode, languageTag };
  }

  public getLocales(): string {
    const tag = i18n.System.getSystemLanguage();
    return JSON.stringify([JoplinI18nModule.toLocaleInfo(tag)]);
  }
}
